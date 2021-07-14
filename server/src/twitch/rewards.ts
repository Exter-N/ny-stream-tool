import DataElement from '../data';
import api, { channelId } from './api';
import { HelixCustomReward, HelixCustomRewardRedemption, HelixCustomRewardRedemptionTargetStatus } from 'twitch';
import { HelixCustomRewardData } from 'twitch/lib/API/Helix/ChannelPoints/HelixCustomReward';

interface LiveRewardData {
    rewards: HelixCustomReward[];
    myRewardIds: string[];
}

interface StoredRewardData {
    rewards: HelixCustomRewardData[];
    myRewardIds: string[];
}

function hydrateRewards(data: StoredRewardData | undefined): LiveRewardData {
    if (null == data) {
        return {
            rewards: [],
            myRewardIds: [],
        };
    }

    return {
        rewards: data.rewards.map(data => new HelixCustomReward(data, api)),
        myRewardIds: data.myRewardIds,
    };
}

function dehydrateRewards(data: LiveRewardData): StoredRewardData {
    return {
        rewards: data.rewards.map(reward => (reward as any)._data as HelixCustomRewardData),
        myRewardIds: data.myRewardIds,
    };
}

const element = new DataElement<LiveRewardData, StoredRewardData>('rewards', hydrateRewards, dehydrateRewards);

const rewards = element.read();

function getRewards(): Promise<HelixCustomReward[]> {
    return api.helix.channelPoints.getCustomRewards(channelId);
}

export async function refreshRewards(): Promise<void> {
    const newRewards = await getRewards();
    rewards.rewards.length = 0;
    rewards.rewards.push(...newRewards);
    element.write(rewards);
}

export async function createReward(title: string, cost: number): Promise<void> {
    const data = await api.helix.channelPoints.createCustomReward(channelId, {
        title,
        cost,
    });

    rewards.rewards.push(data);
    rewards.myRewardIds.push(data.id);
    element.write(rewards);
}

export async function updateRedemptions(ids: string[], rewardId: string, fulfill: boolean): Promise<void> {
    await api.helix.channelPoints.updateRedemptionStatusByIds(channelId, rewardId, ids, fulfill ? 'FULFILLED' : 'CANCELED');
}

if (0 === rewards.rewards.length) {
    refreshRewards();
}

export default rewards;