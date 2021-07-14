import anyAscii from "any-ascii";
import botClient from './tmi-bot';
import { Message, messageSplitFirstWord, messageToString } from "../../../common/chat-message";
import { ptn } from "./command/ptn";
import { ChatUserstate } from "tmi.js";
import { HelixCustomReward } from 'twitch';
import { PubSubRedemptionMessage } from 'twitch-pubsub-client';
import { handleMarquee } from "./command/marquee";
import { handleColor } from "./command/color";
import { disableSceneFilter, enableSceneFilter } from "../obs/filters";
import { setSetting, triggerPyramid } from "../ws";
import settings from "../settings";
import { getOrAddUser, getOrAddUserById, getUserByName, saveUsers } from "../users";
import client, { channel } from "./tmi-caster";
import { PyramidDetector } from "./pyramid";
import { handleDuel } from "./command/duel";
import { dice } from "./command/dice";
import { staticCommand } from "./command/static";
import { rearmTimer } from "./periodic";
import { quote, addQuote, editQuote, deleteQuote } from "./command/quote";
import PublicError from "./public-error";

export type RedemptionReply = [string | undefined, boolean | null];

export function handleCommand(channel: string, userstate: ChatUserstate, message: Message): string  | undefined {
    const [verb, args] = messageSplitFirstWord(message);
    const textVerb = anyAscii(messageToString(verb)).toLowerCase();
    switch (textVerb) {
        case 'ptn':
            return ptn(messageToString(args ?? ''));
        case 'roll':
        case 'dice':
        case 'de':
        case 'des':
        case 'rand':
        case 'random':
            return dice(userstate["display-name"]!, messageToString(args ?? ''));
        case 'quote':
        case 'citation':
        case 'q':
            return quote(userstate, args ?? '');
        case '+q':
        case 'q+':
            return addQuote(userstate, args ?? '');
        case '=q':
        case 'q=':
            return editQuote(userstate, args ?? '');
        case '-q':
        case 'q-':
            return deleteQuote(userstate, args ?? '');
        case 'dbg.log':
            console.log(channel, userstate, args);
            return undefined;
        default:
            if (settings.staticCommands.hasOwnProperty(textVerb)) {
                const command = settings.staticCommands[textVerb];
                if (command.enabled) {
                    return staticCommand(command.reply, userstate['display-name']!, args ?? '');
                }
            }
            return undefined;
    }
}

export async function handleRedemption(channel: string, username: string, rewardType: string, tags: ChatUserstate, parsedMessage: Message): Promise<RedemptionReply> {
    switch (rewardType) {
        case 'highlighted-message':
            handleMarquee(tags, parsedMessage);

            return [undefined, true];
        case 'c86ebe2b-2ccd-4036-af22-bdc622b37054': // Pinceau
            if (!handleColor(messageToString(parsedMessage).split(/\s+/g))) {
                throw new PublicError('C\'est pas comme ça qu\'on fait ! Exemples : -35 45, 00cc00, green');
            } else {
                const now = Date.now();
                setSetting(null, 'statusEffects', settings.statusEffects.concat([
                    {
                        id: 'color-changed',
                        notBefore: now,
                        notAfter: now + 300000,
                    }
                ]));

                return [undefined, true];
            }
        case '6e0ff7b1-bafc-4f1d-9124-9143e7ba9d52': // Duel
            return handleDuel(username, messageToString(parsedMessage));
        default:
            console.log('redeem', channel, username, rewardType, tags, parsedMessage);

            return [undefined, null];
    }
}

export async function handleRedemptionWithoutInput(reward: HelixCustomReward, redemption: PubSubRedemptionMessage): Promise<RedemptionReply> {
    rearmTimer();
    switch (reward.id) {
        case '726e069b-724a-4ad8-a4fe-b09781bf8385': // Ab chro
            enableSceneFilter('Chromatic aberration');
            setTimeout(() => disableSceneFilter('Chromatic aberration'), 180000);
            const now = Date.now();
            setSetting(null, 'statusEffects', settings.statusEffects.concat([
                {
                    id: 'chromatic-aberration',
                    notBefore: now,
                    notAfter: now + 180000,
                },
                {
                    id: 'no-chromatic-aberration',
                    notBefore: now + 180000,
                    notAfter: now + 1800000,
                }
            ]));
            return [undefined, false];
        case 'efdee244-e3fa-4f1e-a05f-b2f4759fbcff': // Trésor
            const user = getOrAddUser(redemption.userId, redemption.userName, redemption.userDisplayName);
            if (user.badges.broadcaster || user.badges.moderator || user.badges.vip) {
                return [undefined, false];
            }
            if (null != settings.ephemeralVip) {
                const previousUser = await getOrAddUserById(settings.ephemeralVip);
                if (null == previousUser) {
                    return [undefined, false];
                }
                client.unvip('#' + channel, previousUser.name);
                delete previousUser.badges.vip;
            }
            client.vip('#' + channel, user.name);
            user.badges.vip = '1';
            if (!user.achievements.includes('ephemeral-vip')) {
                user.achievements.push('ephemeral-vip');
            }
            setSetting(null, 'ephemeralVip', user.id);
            saveUsers(true);

            return [undefined, true];
        default:
            console.log('redeem without input', redemption.userName, reward.id, reward.title);
            return [undefined, null];
    }
}

export function handlePyramid(userstate: ChatUserstate, pyramidState: PyramidDetector): void {
    botClient.say(channel, 'ChatPyramid');
    triggerPyramid(null);

    const user = getOrAddUser(userstate['user-id']!, userstate.username!, userstate['display-name']!);
    let hasUpdate = false;
    for (let i = 2; i <= 5; ++i) {
        if (pyramidState.maxHeight >= i && !user.achievements.includes('pyramid' + i)) {
            user.achievements.push('pyramid' + i);
            hasUpdate = true;
        }
    }
    if (hasUpdate) {
        saveUsers(true);
    }
}

{
    const now = Date.now();

    const aberration = settings.statusEffects.find(fx => fx.id === 'chromatic-aberration');
    if (null != aberration) {
        enableSceneFilter('Chromatic aberration');
        if (aberration.notAfter > now) {
            setTimeout(() => disableSceneFilter('Chromatic aberration'), aberration.notAfter - now);
        } else {
            disableSceneFilter('Chromatic aberration');
        }
    }
}