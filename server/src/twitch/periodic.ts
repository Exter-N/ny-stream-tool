import settings, { settingsAddOnChange } from "../settings";
import botClient from "./tmi-bot";
import { channel } from "./tmi-caster";

const TIMER_BASE = 900000;
const TIMER_SHORTEN = 30000;
const TIMER_MIN = 60000;

let shallSendMessage = false;
let nextMessage = -Infinity;
let timer: NodeJS.Timeout | null = null;
let messageOffset = 0;

settingsAddOnChange('periodicMessages', value => {
    messageOffset %= Math.max(value.length, 1);
});

function sendMessage(): void {
    const now = Date.now();
    if (shallSendMessage) {
        shallSendMessage = false;
        const next = settings.periodicMessages.slice(messageOffset).concat(settings.periodicMessages.slice(0, messageOffset)).find(mq => false !== mq.enabled);
        if (null != next) {
            messageOffset = (settings.periodicMessages.indexOf(next) + 1) % settings.periodicMessages.length;
            nextMessage = now + TIMER_BASE;
            timer = setTimeout(sendMessage, TIMER_BASE);
            botClient.say('#' + channel, next.message);
        } else {
            timer = null;
        }
    } else {
        timer = null;
    }
}

export function rearmTimer(): void {
    const now = Date.now();
    shallSendMessage = true;
    if (null == timer) {
        nextMessage = now + TIMER_MIN;
        timer = setTimeout(sendMessage, TIMER_MIN);
    } else {
        const newNextMessage = Math.max(now + TIMER_MIN, nextMessage - TIMER_SHORTEN);
        if (newNextMessage < nextMessage) {
            nextMessage = newNextMessage;
            clearTimeout(timer);
            timer = setTimeout(sendMessage, newNextMessage - now);
        }
    }
}