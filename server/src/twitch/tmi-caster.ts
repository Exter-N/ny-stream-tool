import * as tmi from 'tmi.js';
import { addStopHandler } from '../stop';
import { isBadMessage } from './bad-message';
import { handleMarqueeBan, handleMarqueeDelete } from './command/marquee';
import { reactToEmotes } from './emote-react';
import { PyramidDetector } from './pyramid';
import rewards, { updateRedemptions } from './rewards';
import isBot from '../ffz/is-bot';
import { parseMessage } from './message-parser';
import { Message, messageRemoveStart } from '../../../common/chat-message';
import { arrayDeleteFound } from '../../../util/array';
import { handleCommand, handlePyramid, handleRedemption, RedemptionReply } from './handler';
import { playSound } from '../ws';
import { Cooldown } from '../cooldown';
import users, { User, getOrAddUser, saveUsers, getOrAddUserByName } from '../users';
import { objectShallowEquals } from '../../../util/object';
import api, { channelId } from './api';
import { HelixUser } from 'twitch';
import { rearmTimer } from './periodic';
import botClient from './tmi-bot';
import PublicError from './public-error';

export const channel = process.env.CHANNEL!;

const client = new tmi.client({
    identity: {
        username: channel,
        password: process.env.CASTER_TMI_TOKEN!,
    },
    channels: [
        channel,
    ],
    connection: {
        reconnect: true,
        secure: true,
    },
    options: {
    },
});

const cdNope = new Cooldown(60000);

const pyramidState = new PyramidDetector();

function preHandle(channel: string, userstate: tmi.ChatUserstate, message: Message): boolean {
    if (isBadMessage(userstate, message)) {
        if (null != userstate.id) {
            client.deletemessage(channel, userstate.id);
            if (cdNope.activate()) {
                playSound(null, 'nope.mp3');
            }
        }

        return false;
    }
    if (null == userstate.username || isBot(userstate)) {
        return false;
    }
    const user = getOrAddUser(userstate['user-id']!, userstate.username, userstate['display-name']!);
    if (null != userstate.badges && !objectShallowEquals(user.badges, userstate.badges) || null != userstate['badge-info'] && !objectShallowEquals(user.badgeInfo, userstate['badge-info'])) {
        if (null != userstate.badges) {
            user.badges = userstate.badges;
        }
        if (null != userstate['badge-info']) {
            user.badgeInfo = userstate['badge-info'];
        }
        saveUsers(true);
    }
    reactToEmotes(message);
    rearmTimer();

    return true;
}

function handleCommand2(channel: string, userstate: tmi.ChatUserstate, message: Message): void {
    try {
        const reply = handleCommand(channel, userstate, message);
        if (null != reply) {
            botClient.say(channel, reply);
        }
    } catch (e) {
        if (e instanceof PublicError) {
            botClient.say(channel, '@' + userstate['display-name'] + ' ' + e.message);
        } else {
            throw e;
        }
    }
}

client.on('cheer', (channel, userstate, message) => {
    if (!channel.startsWith('#')) {
        return;
    }

    const parsedMessage = parseMessage(message, userstate);
    if (!preHandle(channel, userstate, parsedMessage)) {
        return;
    }

    const command = messageRemoveStart(parsedMessage, '!');
    if (null != command) {
        return handleCommand2(channel, userstate, command);
    }

    if (pyramidState.update(userstate['user-id'], parsedMessage)) {
        handlePyramid(userstate, pyramidState);
    }
});

client.on('message', (channel, userstate, message, self) => {
    if (self || !channel.startsWith('#')) {
        return;
    }

    const parsedMessage = parseMessage(message, userstate);
    if (!preHandle(channel, userstate, parsedMessage)) {
        return;
    }

    const command = messageRemoveStart(parsedMessage, '!');
    if (null != command) {
        return handleCommand2(channel, userstate, command);
    }

    if (pyramidState.update(userstate['user-id'], parsedMessage)) {
        handlePyramid(userstate, pyramidState);
    }
});

async function handleRedemption2(channel: string, username: string, rewardType: string, userstate: tmi.ChatUserstate, message?: string): Promise<RedemptionReply> {
    const parsedMessage = (null == message) ? '' : parseMessage(message, userstate);
    if (!preHandle(channel, userstate, parsedMessage)) {
        return [undefined, false];
    }

    return await handleRedemption(channel, username, rewardType, userstate, parsedMessage);
}

interface PendingRedemption {
    reward: string;
    user: string;
    input: string;
}

const aheadRedemptions: (PendingRedemption & { id: string; })[] = [];
const behindRedemptions: (PendingRedemption & { fulfill: boolean | null; })[] = [];

export function queueRedemption(reward: string, user: string, input: string, id: string): boolean | null {
    const behindRedemption = arrayDeleteFound(behindRedemptions, r => r.reward === reward && r.user === user && r.input === input);

    if (behindRedemption.deleted) {
        return behindRedemption.element.fulfill;
    } else {
        aheadRedemptions.push({ reward, user, input, id });

        return null;
    }
}

client.on('redeem', async (channel, username, rewardType, userstate, message?: string) => {
    if (!channel.startsWith('#')) {
        return;
    }

    const handleQueue = rewards.myRewardIds.includes(rewardType) && false === rewards.rewards.find(r => r.id === rewardType)?.autoApproved;
    let reply: RedemptionReply;
    try {
        reply = await handleRedemption2(channel, username, rewardType, userstate, message);
    } catch (e) {
        if (e instanceof PublicError) {
            reply = ['@' + userstate['display-name'] + ' ' + e.message, false];
        } else {
            throw e;
        }
    }
    if (null != reply[0]) {
        botClient.say('#' + channel, reply[0]);
    }
    if (!handleQueue) {
        return;
    }

    const aheadRedemption = arrayDeleteFound(aheadRedemptions, r => r.reward === rewardType && r.user === userstate['user-id'] && r.input === (message ?? ''));

    if (aheadRedemption.deleted) {
        if (null != reply[1]) {
            try {
                await updateRedemptions([ aheadRedemption.element.id ], rewardType, reply[1]);
            } catch (e) {
                console.error(e);
            }
        }
    } else {
        behindRedemptions.push({ reward: rewardType, user: userstate['user-id']!, input: message ?? '', fulfill: reply[1] });
    }
});

client.on('messagedeleted', (channel, username, deletedMessage, userstate) => {
    handleMarqueeDelete(deletedMessage);
});

client.on('timeout', (channel, username, reason, duration, userstate?: { 'target-user-id': string; 'room-id': string; }) => {
    const user = userstate?.['target-user-id'];
    if (null != user) {
        handleMarqueeBan(user);
    }
});

client.on('ban', (channel, username, reason, userstate?: { 'target-user-id': string; 'room-id': string; }) => {
    const user = userstate?.['target-user-id'];
    if (null != user) {
        handleMarqueeBan(user);
    }
});

client.on('mod', async (channel, username) => {
    if (!channel.startsWith('#')) {
        return;
    }

    const user = await getOrAddUserByName(username);
    if (null != user && setBadge(user, 'moderator', true)) {
        saveUsers(true);
    }
});

client.on('unmod', async (channel, username) => {
    if (!channel.startsWith('#')) {
        return;
    }

    const user = await getOrAddUserByName(username);
    if (null != user && setBadge(user, 'moderator', false)) {
        saveUsers(true);
    }
});

client.on('raided', (channel, username, viewers) => {
    client.r9kbeta(channel);
    setTimeout(() => client.r9kbetaoff(channel), 15000);
})

function setBadge(user: User, badge: keyof tmi.Badges, status: boolean): boolean {
    if (user.badges[badge] && !status) {
        delete user.badges[badge];

        return true;
    } else if (status && !user.badges[badge]) {
        user.badges[badge] = '1';

        return true;
    }

    return false;
}

export async function refreshRoles(): Promise<void> {
    const [ mods, vips ] = await Promise.all([ client.mods('#' + channel), client.vips('#' + channel) ]);
    const all = [channel].concat(mods, vips);
    const requests: Promise<HelixUser[]>[] = [];
    while (all.length > 0) {
        requests.push(api.helix.users.getUsersByNames(all.splice(0, Math.min(50, all.length))));
    }
    const helixUsers = (requests.length > 0) ? ([] as HelixUser[]).concat(...await Promise.all(requests)) : [];
    for (const helixUser of helixUsers) {
        getOrAddUser(helixUser.id, helixUser.name, helixUser.displayName);
    }
    let hasUpdate = false;
    for (const user of Object.values(users)) {
        if (setBadge(user, 'broadcaster', user.id === String(channelId))) {
            hasUpdate = true;
        }
        if (setBadge(user, 'moderator', mods.includes(user.name))) {
            hasUpdate = true;
        }
        if (setBadge(user, 'vip', vips.includes(user.name))) {
            hasUpdate = true;
        }
    }
    if (hasUpdate) {
        saveUsers(true);
    }
}

addStopHandler(async () => {
    await client.disconnect();
});

client.connect();

export default client;