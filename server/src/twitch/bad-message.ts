import anyAscii from 'any-ascii';
import { ChatUserstate } from 'tmi.js';
import { Message, messageIncludesEmote, messageToString } from '../../../common/chat-message';

export function isBadMessage(userstate: ChatUserstate, message: Message): boolean {
    if (userstate.badges?.broadcaster) {
        return false;
    }

    const normalizedMessage = anyAscii(messageToString(message)).toLowerCase();

    if (/\bwanna\s*become\s*famous\b/.test(normalizedMessage)) {
        return true;
    }

    if (Array.isArray(message)) {
        if (messageIncludesEmote(message, 'ffz', 433902)) {
            return true;
        }
    }

    return false;
}