export interface Emote {
    name: string;
    width: number;
    height: number;
    url1x: string;
    url2x?: string;
    url4x?: string;
    source?: 'emoji' | 'twitch' | 'ffz';
    id?: string | number;
}

export interface TextRun {
    text: string;
    color?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    href?: string;
}

export type MessagePart = string | TextRun | Emote;
export type Message = string | MessagePart[];

export function messageToString(message: Message): string {
    if (Array.isArray(message)) {
        return message.map(part => {
            if (typeof part == 'string') {
                return part;
            } else if ('text' in part) {
                return part.text;
            } else if ('name' in part) {
                return part.name;
            } else {
                return '';
            }
        }).join('');
    } else {
        return message;
    }
}

export function messageEquals(left: Message, right: Message): boolean {
    if (Array.isArray(left)) {
        if (!Array.isArray(right)) {
            return false;
        }

        return left.length === right.length && left.every((part, i) => {
            if (typeof part == 'string') {
                return part === right[i];
            } else if ('text' in part) {
                return part.text === (right[i] as any).text;
            } else if ('name' in part) {
                if ('source' in part) {
                    return part.source === (right[i] as any).source && part.id === (right[i] as any).id;
                }

                return part.name === (right[i] as any).name;
            } else {
                return true;
            }
        });
    } else {
        if (Array.isArray(right)) {
            return false;
        }

        return left === right;
    }
}

function partIsEmpty(part: MessagePart): boolean {
    if (typeof part == 'string') {
        return 0 === part.length;
    } else if ('text' in part) {
        return 0 === part.text.length;
    } else {
        return false;
    }
}

function partIsNotEmpty(part: MessagePart): boolean {
    return !partIsEmpty(part);
}

export function messageIsEmpty(message: Message): boolean {
    if (Array.isArray(message)) {
        return message.every(partIsEmpty);
    } else {
        return 0 === message.length;
    }
}

export function messageIsNotEmpty(message: Message): boolean {
    return !messageIsEmpty(message);
}

export function messageIncludesEmote(message: Message, source: Exclude<Emote['source'], undefined>, id: Exclude<Emote['id'], undefined>): boolean {
    return Array.isArray(message) && message.some(part => typeof part == 'object' && 'name' in part && part.source === source && part.id === id);
}

export function messageSimplify(message: Message): Message {
    if (Array.isArray(message)) {
        message = message.filter(partIsNotEmpty);

        for (let i = message.length - 1; i-- > 0; ) {
            const next = message[i + 1];
            if (typeof message[i] == 'string' && typeof next == 'string') {
                message[i] += next;
                message.splice(i + 1, 1);
            }
        }

        switch (message.length) {
            case 0:
                return '';
            case 1:
                if (typeof message[0] == 'string') {
                    return message[0];
                }
                break;
        }

        return message;
    } else {
        return message;
    }
}

export function messageConcat(...messages: Message[]): Message {
    const message: Message = [];
    for (const msg of messages) {
        if (Array.isArray(msg)) {
            message.push(...msg);
        } else {
            message.push(msg);
        }
    }

    return messageSimplify(message);
}

function _messageRemoveStart(message: Message, start: string, first: string, newPart0: () => MessagePart): Message | undefined {
    if (start.length > first.length) {
        if (start.startsWith(first)) {
            return messageRemoveStart(message.slice(1), start.substr(first.length));
        } else {
            return undefined;
        }
    } else {
        if (first.startsWith(start)) {
            const rest = message.slice(1);
            if (first.length === start.length) {
                return rest;
            } else {
                return ([newPart0()] as MessagePart[]).concat(rest);
            }
        } else {
            return undefined;
        }
    }
}

export function messageRemoveStart(message: Message, start: string): Message | undefined {
    if (Array.isArray(message)) {
        const first = message[0];
        if (null == first) {
            return undefined;
        }

        if (typeof first == 'string') {
            return _messageRemoveStart(message, start, first, () => first.substr(start.length));
        } else if ('text' in first) {
            return _messageRemoveStart(message, start, first.text, () => Object.assign({ }, first, { text: first.text.substr(start.length) }));
        } else {
            return undefined;
        }
    } else {
        if (message.startsWith(start)) {
            return message.substr(start.length);
        } else {
            return undefined;
        }
    }
}

export function messageTrim(message: Message): Message {
    if (Array.isArray(message)) {
        message = message.slice();
        while (message.length > 1) {
            const last = message[message.length - 1];
            if (typeof last == 'string') {
                const trimmed = last.trimEnd();
                if (trimmed.length > 0) {
                    message[message.length - 1] = trimmed;
                    break;
                }
                message.pop();
            } else if ('text' in last) {
                const trimmed = last.text.trimEnd();
                if (trimmed.length > 0) {
                    message[message.length - 1] = Object.assign({ }, last, { text: trimmed });
                    break;
                }
                message.pop();
            } else {
                break;
            }
        }
        while (message.length > 1) {
            const first = message[0];
            if (typeof first == 'string') {
                const trimmed = first.trimStart();
                if (trimmed.length > 0) {
                    message[0] = trimmed;
                    break;
                }
                message.shift();
            } else if ('text' in first) {
                const trimmed = first.text.trimStart();
                if (trimmed.length > 0) {
                    message[0] = Object.assign({ }, first, { text: trimmed });
                    break;
                }
                message.shift();
            } else {
                break;
            }
        }
        if (message.length === 1) {
            const only = message[0];
            if (typeof only == 'string') {
                return only.trim();
            } else if ('text' in only) {
                const trimmed = only.text.trim();
                if (trimmed.length > 0) {
                    return [Object.assign({ }, only, { text: trimmed })];
                }
                return '';
            } else {
                return message;
            }
        }

        return message;
    } else {
        return message.trim();
    }
}

export function messageSplit(message: Message, splitter: { [Symbol.split]: (string: string) => string[]; }): Message[] {
    if (Array.isArray(message)) {
        message = message.slice();
        const messages: Message[] = [message];
        for (let i = message.length; i-- > 0; ) {
            const part = message[i];
            if (typeof part == 'string') {
                const parts = part.split(splitter);
                switch (parts.length) {
                    case 0:
                        message.splice(i, 1);
                        break;
                    case 1:
                        message[i] = parts[0];
                        break;
                    default:
                        const tail = message.splice(i + 1);
                        tail.unshift(parts.pop()!);
                        message[i] = parts.shift()!;
                        messages.splice(1, 0, ...parts, tail);
                        break;
                }
            } else if ('text' in part) {
                const parts = part.text.split(splitter);
                switch (parts.length) {
                    case 0:
                        message.splice(i, 1);
                        break;
                    case 1:
                        message[i] = Object.assign({ }, part, { text: parts[0] });
                        break;
                    default:
                        const tail = message.splice(i + 1);
                        tail.unshift(Object.assign({ }, part, { text: parts.pop()! }));
                        message[i] = Object.assign({ }, part, { text: parts.shift()! });
                        messages.splice(1, 0, ...parts.map(pt => [ Object.assign({ }, part, { text: pt }) ]), tail);
                        break;
                }
            }
        }

        return messages.map(messageSimplify);
    } else {
        return message.split(splitter);
    }
}

export function messageSplitFirst(message: Message, matcher: { [Symbol.match]: (string: string) => RegExpMatchArray | null; }): [Message] | [Message, Message, string] {
    if (Array.isArray(message)) {
        for (let i = 0; i < message.length; ++i) {
            const part = message[i];
            if (typeof part == 'string') {
                const match = part.match(matcher);
                if (null != match) {
                    if (null == match.index || null == match[0]) {
                        throw new Error('Matcher must not be a global RegExp');
                    }

                    return [
                        messageSimplify(message.slice(0, i).concat([part.substr(0, match.index)])),
                        messageSimplify(([part.substr(match.index + match[0].length)] as MessagePart[]).concat(message.slice(i + 1))),
                        match[0],
                    ];
                }
            } else if ('text' in part) {
                const match = part.text.match(matcher);
                if (null != match) {
                    if (null == match.index || null == match[0]) {
                        throw new Error('Matcher must not be a global RegExp');
                    }

                    return [
                        messageSimplify(message.slice(0, i).concat([Object.assign({ }, part, { text: part.text.substr(0, match.index) })])),
                        messageSimplify(([Object.assign({ }, part, { text: part.text.substr(match.index + match[0].length) })] as MessagePart[]).concat(message.slice(i + 1))),
                        match[0],
                    ];
                }
            }
        }

        return [message];
    } else {
        const match = message.match(matcher);
        if (null != match) {
            if (null == match.index || null == match[0]) {
                throw new Error('Matcher must not be a global RegExp');
            }

            return [
                message.substr(0, match.index),
                message.substr(match.index + match[0].length),
                match[0],
            ];
        }

        return [message];
    }
}

const SPACES = /\s+/;
const DQ_SPACES = /"($|\s+)/;
const SQ_SPACES = /'($|\s+)/;

export function messageSplitFirstWord(message: Message, allowQuoting: boolean = false): [Message] | [Message, Message] {
    let matcher = SPACES;
    if (allowQuoting) {
        let quoted: Message | undefined;
        if (null != (quoted = messageRemoveStart(message, '"'))) {
            message = quoted;
            matcher = DQ_SPACES;
        } else if (null != (quoted = messageRemoveStart(message, "'"))) {
            message = quoted;
            matcher = SQ_SPACES;
        }
    }

    const split = messageSplitFirst(message, matcher);
    if (split.length > 2) {
        return split.slice(0, 2) as [Message, Message];
    } else {
        return split as [Message] | [Message, Message];
    }
}

export function messageMap(message: Message, fn: (part: MessagePart, index: number, message: Message) => MessagePart | Message): Message {
    if (!Array.isArray(message)) {
        message = [message];
    }

    const newMessage: MessagePart[] = [];
    for (let i = 0; i < message.length; ++i) {
        const parts = fn(message[i], i, message);
        if (Array.isArray(parts)) {
            newMessage.push(...parts.filter(partIsNotEmpty));
        } else {
            if (!partIsEmpty(parts)) {
                newMessage.push(parts);
            }
        }
    }

    return messageSimplify(newMessage);
}

function mergeTextRun(run: TextRun, newText: MessagePart): MessagePart {
    if (typeof newText == 'string') {
        return Object.assign({ }, run, { text: newText });
    } else if ('text' in newText) {
        return Object.assign({ }, run, newText);
    } else {
        return newText;
    }
}

export function messageMapText(message: Message, fn: (part: string, index: number, message: Message) => MessagePart | Message): Message {
    return messageMap(message, (part, index) => {
        if (typeof part == 'string') {
            return fn(part, index, message);
        } else if ('text' in part) {
            const newText = fn(part.text, index, message);
            if (newText === part.text) {
                return part;
            }

            if (Array.isArray(newText)) {
                return newText.map(pt => mergeTextRun(part, pt));
            } else {
                return mergeTextRun(part, newText);
            }
        } else {
            return part;
        }
    });
}