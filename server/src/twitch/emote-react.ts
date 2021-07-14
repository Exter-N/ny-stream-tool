import { Message, messageIncludesEmote } from "../../../common/chat-message";
import { Cooldown } from "../cooldown";
import { playSound } from "../ws";

const cdCEstGenial = new Cooldown(60000);
const cdMweep = new Cooldown(60000);

export function reactToEmotes(message: Message): void {
    if (!Array.isArray(message)) {
        return;
    }

    if (messageIncludesEmote(message, 'twitch', '307440320') && cdCEstGenial.activate()) { // meosceStGenial
        playSound(null, 'c-est-genial.wav');
    }

    if (messageIncludesEmote(message, 'twitch', '300313551') && cdMweep.activate()) { // kayzo5Mweep
        playSound(null, 'mweep.mp3');
    }
}