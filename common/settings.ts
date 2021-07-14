import { Message, messageEquals, messageToString } from "./chat-message";

export interface Marquee {
    enabled: boolean;
    author?: string;
    color?: string;
    type?: 'chat' | 'action';
    message: Message;
    id?: string;
    user?: string;
}

export interface StatusEffect {
    id: string;
    notBefore: number;
    notAfter: number;
}

export interface StaticCommand {
    reply: string;
    enabled: boolean;
}

export interface Quote {
    id: number;
    quote: string;
    author?: string;
    enabled: boolean;
}

export interface PeriodicMessage {
    message: string;
    enabled: boolean;
}

export interface Settings {
    chromaA: number;
    chromaB: number;
    top: number;
    bottom: number;
    left: number;
    right: number;
    avatar: boolean;
    marqueesRight: number;
    marquees: Marquee[];
    marqueesOnce: Marquee[];
    title: string;
    presetTitles: string[];
    statusEffects: StatusEffect[];
    ephemeralVip: string | null;
    staticCommands: { [name: string]: StaticCommand; };
    periodicMessages: PeriodicMessage[];
    quotes: Quote[];
    nextQuoteId: number;
}

export function marqueeEquals(left: Marquee, right: Marquee): boolean {
    return (null != left.id || null != right.id) ? (left.id === right.id) : (left.author === right.author && left.color === right.color && messageEquals(left.message, right.message) && left.type === right.type);
}

export function getMarqueeKey(marquee: Marquee): string {
    return (null != marquee.id) ? marquee.id : (marquee.author + '\0' + marquee.color + '\0' + messageToString(marquee.message) + '\0' + marquee.type);
}

export function parseMarqueeType(type: string | undefined): Marquee['type'] {
    return (null == type || 'chat' === type || 'action' === type) ? type : undefined;
}

export function getBlankMarquee(): Required<Marquee> {
    return {
        enabled: true,
        author: '',
        color: '#ffffff',
        type: 'chat',
        message: '',
        id: '',
        user: '',
    };
}

export function getBlankSettings(): Settings {
    return {
        chromaA: -35,
        chromaB: 45,
        top: 1,
        bottom: 0.1,
        left: 0,
        right: 1,
        marqueesRight: 208,
        avatar: true,
        marquees: [],
        marqueesOnce: [],
        title: '',
        presetTitles: [],
        statusEffects: [],
        ephemeralVip: null,
        staticCommands: {},
        periodicMessages: [],
        quotes: [],
        nextQuoteId: 1,
    };
}