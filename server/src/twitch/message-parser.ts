import { ChatUserstate } from "tmi.js";
import { Emote, Message, messageMapText, MessagePart, messageSimplify, messageTrim } from "../../../common/chat-message";
import emotes from "../ffz/emotes";
import room from "../ffz/room";
import { Emote as FFZEmote } from "../ffz/schema";
import regExpEscape from "../../../util/regexp-escape";

function createTwitchEmote(id: string, name: string): Emote {
    return {
        name,
        width: 28,
        height: 28,
        url1x: 'https://static-cdn.jtvnw.net/emoticons/v2/' + id + '/default/dark/1.0',
        url2x: 'https://static-cdn.jtvnw.net/emoticons/v2/' + id + '/default/dark/2.0',
        url4x: 'https://static-cdn.jtvnw.net/emoticons/v2/' + id + '/default/dark/4.0',
        source: 'twitch',
        id,
    };
}

function createFFZEmote(emote: FFZEmote): Emote {
    const em: Emote = {
        name: emote.name,
        width: emote.width,
        height: emote.height,
        url1x: emote.urls['1'],
        source: 'ffz',
        id: emote.id,
    };

    if (null != emote.urls['2']) {
        em.url2x = emote.urls['2'];
    }
    if (null != emote.urls['4']) {
        em.url4x = emote.urls['4'];
    }

    return em;
}

function parseTwitchEmotes(message: string, userstate: ChatUserstate): Message {
    if (null == userstate.emotes) {
        return message;
    }

    const ranges: [number, number, string][] = [];
    for (const [id, rgs] of Object.entries(userstate.emotes)) {
        for (const rg of rgs) {
            const [first, last] = rg.split(/-/);
            ranges.push([Number(first), Number(last), id]);
        }
    }

    if (0 === ranges.length) {
        return message;
    }

    ranges.sort((x, y) => x[0] - y[0]);

    const parsed: MessagePart[] = [message];
    for (let i = ranges.length; i-- > 0; ) {
        const head = parsed[0] as string;
        const [first, last, id] = ranges[i];
        parsed.splice(1, 0, createTwitchEmote(id, head.substr(first, last + 1 - first)), head.substr(last + 1));
        parsed[0] = head.substr(0, first);
    }

    return messageSimplify(parsed);
}

class FFZEmoteParser {
    readonly activeEmoteNames: readonly string[];
    readonly activeEmoteRegExp: RegExp;
    readonly activeEmotes: { [K: string]: FFZEmote; };
    constructor() {
        const activeEmotes: FFZEmote[] = [];
        for (const set of emotes.default_sets) {
            const setEmotes = emotes.sets[set]?.emoticons;
            if (null != setEmotes) {
                activeEmotes.push(...setEmotes);
            }
        }
        {
            const setEmotes = room.sets[room.room.set]?.emoticons;
            if (null != setEmotes) {
                activeEmotes.push(...setEmotes);
            }
        }

        const activeEmoteNames = activeEmotes.map(e => e.name);
        activeEmoteNames.sort();

        this.activeEmoteNames = activeEmoteNames;
        this.activeEmoteRegExp = new RegExp('(?<=\\s)(?:' + activeEmoteNames.map(regExpEscape).join('|') + ')(?=\\s)', 'g');
        this.activeEmotes = Object.create(null);
        for (const e of activeEmotes) {
            this.activeEmotes[e.name] = e;
        }

        this.parse = this.parse.bind(this);
    }
    parse(part: string, index: number, message: Message): Message {
        let reInput = part;
        let inputPadding = 0;
        if (0 === index) {
            reInput = ' ' + reInput;
            ++inputPadding;
        }
        if (!Array.isArray(message) || index === message.length - 1) {
            reInput += ' ';
        }

        const emotes: [number, string][] = [];

        let match: RegExpExecArray | null;
        while (null != (match = this.activeEmoteRegExp.exec(reInput))) {
            emotes.push([match.index - inputPadding, match[0]]);
        }

        if (0 === emotes.length) {
            return part;
        }

        const parsed: MessagePart[] = [part];
        for (let i = emotes.length; i-- > 0; ) {
            const head = parsed[0] as string;
            const [first, name] = emotes[i];
            parsed.splice(1, 0, createFFZEmote(this.activeEmotes[name]), head.substr(first + name.length));
            parsed[0] = head.substr(0, first);
        }

        return parsed;
    }
}

let ffzEmoteParser: FFZEmoteParser | null = null;

export function resetFFZEmoteParser(): void {
    ffzEmoteParser = null;
}

export function parseMessage(message: string, userstate: ChatUserstate): Message {
    let parsed = parseTwitchEmotes(message, userstate);
    if (null == ffzEmoteParser) {
        ffzEmoteParser = new FFZEmoteParser();
    }
    parsed = messageMapText(parsed, ffzEmoteParser.parse);

    return messageTrim(parsed);
}