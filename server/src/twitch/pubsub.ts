import { PubSubClient } from 'twitch-pubsub-client';
import api, { channelId } from './api';
import rewards, { updateRedemptions } from './rewards';
import { handleRedemptionWithoutInput, RedemptionReply } from './handler';
import { channel, queueRedemption } from './tmi-caster';
import botClient from './tmi-bot';
import PublicError from './public-error';

const pubSub = new PubSubClient();

(async function () {
    await pubSub.registerUserListener(api);

    pubSub.onRedemption(channelId, async message => {
        const reward = rewards.rewards.find(r => r.id === message.rewardId);
        if (null == reward) {
            return;
        }

        const handleQueue = rewards.myRewardIds.includes(reward.id) && !reward.autoApproved;

        let reply: RedemptionReply;
        try {
            reply = reward.userInputRequired ? [undefined, queueRedemption(reward.id, message.userId, message.message, message.id)] : await handleRedemptionWithoutInput(reward, message);
        } catch (e) {
            if (e instanceof PublicError) {
                reply = ['@' + message.userDisplayName + ' ' + e.message, false];
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

        if (null != reply[1]) {
            try {
                await updateRedemptions([ message.id ], reward.id, reply[1]);
            } catch (e) {
                console.error(e);
            }
        }
    });
})();