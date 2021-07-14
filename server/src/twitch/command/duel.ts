import { Badges } from "tmi.js";
import { getUserByName, User } from "../../users";
import client, { channel } from "../tmi-caster";
import { randomElement } from "../../../../util/array";
import { RedemptionReply } from "../handler";

const MESSAGE_BASE = '{from} provoque {to} en duel, {1} {2}';

const AUTO_WIN_MESSAGES_1 = [
    'et le/la massacre sauvagement !',
    'et le/la réduit en poussière !',
    'et le/la met en charpie !',
    'et le/la taille en pièces !',
    'et l\'abat froidement avant même qu\'il/elle n\'ait compris ce qui se passait !',
];
const AUTO_LOSE_MESSAGES_1 = [
    'mais se fait massacrer sauvagement !',
    'mais se fait réduire en poussière !',
    'mais se fait mettre en charpie !',
    'mais se fait tailler en pièces !',
    'mais se fait abattre froidement avant même d\'avoir compris ce qui se passait !',
];
const AUTO_MESSAGES_2 = [
    'Le/la pauvre n\'avait aucune chance …',
    'Ce n\'était pas très fair-play envers {loser} …',
    '{winner} n\'est pas là pour enfiler des perles …',
];

const BALANCED_WIN_MESSAGES_1 = [
    'et décroche la victoire, même si {loser} s\'est bien battu(e).',
    'et, après un beau combat, finit par le/la mettre au tapis !',
    'et finit par asséner le coup de grâce, scellant une victoire qu\'il/elle aura du bien mériter !'
];
const BALANCED_LOSE_MESSAGES_1 = [
    'mais ne parvient pas à l\'emporter, quoiqu\'il/elle se soit bien battu(e).',
    'mais, malgré un beau combat, finit par se faire mettre au tapis …',
    'mais c\'est {winner} qui finit par asséner le coup de grâce, scellant une victoire qu\'il/elle aura du bien mériter !',
];
const BALANCED_MESSAGES_2 = [
    'Peut-être en sera-t-il autrement lors de la prochaine manche !',
    'C\'était tout de même serré, il sera intéressant de revoir ces deux-là dans l\'arène !',
];

function getRole(badges: Badges): 0 | 1 | 2  | 3 {
    if (badges.broadcaster) {
        return 3;
    } else if (badges.moderator) {
        return 2;
    } else if (badges.vip) {
        return 1;
    } else {
        return 0;
    }
}

const RE_PARTS = /\{([12])\}/g;
const RE_VARS = /\{(from|to|winner|loser)\}/g;

interface Parts {
    '1': string;
    '2': string;
}

interface Vars {
    from: string;
    to: string;
    winner: string;
    loser: string;
}

function formatMessage(from: string, to: string, win: boolean, pool1: string[], pool2: string[]): string {
    const parts: Parts = {
        '1': randomElement(pool1)!,
        '2': randomElement(pool2)!,
    };
    const vars: Vars = {
        from,
        to,
        winner: win ? from : to,
        loser: win ? to : from,
    };

    return MESSAGE_BASE
        .replace(RE_PARTS, (_, key) => parts[key as keyof Parts])
        .replace(RE_VARS, (_, key) => vars[key as keyof Vars]);
}

interface DuelResult {
    winRate: number;
    fulfill?: boolean;
}

function duel(from: User, to: User): DuelResult | null {
    const roleFrom = getRole(from.badges);
    const roleTo = getRole(to.badges);

    if (roleTo >= 2 && roleFrom >= 2) {
        return null;
    }

    if (roleFrom !== roleTo) {
        return {
            winRate: (roleFrom > roleTo) ? 1 : 0,
            fulfill: roleTo < 2 && roleFrom < 2,
        };
    }

    return { winRate: 0.5 };
}

export async function handleDuel(from: string, to: string): Promise<RedemptionReply> {
    const userFrom = getUserByName(from);
    const userTo = getUserByName(to);
    if (null == userFrom || null == userTo) {
        return [undefined, false];
    }

    const result = duel(userFrom, userTo);
    if (null == result) {
        return ['Voyons ' + userFrom.displayName + ', est-ce bien raisonnable ?', false];
    }

    const { winRate, fulfill } = result;
    const reason = 'Duel de ' + userFrom.displayName + ' à ' + userTo.displayName + ' (' + Math.round(winRate * 100) + ' %)';
    const win = Math.random() < result.winRate;

    let pool1: string[], pool2: string[];
    if (winRate >= 1) {
        pool1 = AUTO_WIN_MESSAGES_1;
        pool2 = AUTO_MESSAGES_2;
    } else if (winRate <= 0) {
        pool1 = AUTO_LOSE_MESSAGES_1;
        pool2 = AUTO_MESSAGES_2;
    } else {
        pool1 = win ? BALANCED_WIN_MESSAGES_1 : BALANCED_LOSE_MESSAGES_1;
        pool2 = BALANCED_MESSAGES_2;
    }

    await client.timeout('#' + channel, win ? to : from, 90, reason);

    return [formatMessage(userFrom.displayName, userTo.displayName, win, pool1, pool2), fulfill ?? true];
}