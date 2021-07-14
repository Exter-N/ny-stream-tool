import { ChatUserstate } from 'tmi.js';
import { Message } from '../../../../common/chat-message';
import { parseMarqueeType } from '../../../../common/settings';
import settings from '../../settings';
import { setSetting } from '../../ws';

export function handleMarquee(userstate: ChatUserstate, message: Message): void {
    if (userstate.badges?.broadcaster || userstate.badges?.moderator || userstate.badges?.vip) {
        setSetting(null, 'marqueesOnce', (settings.marqueesOnce ?? [ ]).concat([
            {
                author: userstate['display-name'] ?? userstate.username,
                color: userstate.color,
                type: parseMarqueeType(userstate['message-type']),
                message,
                id: userstate.id,
                user: userstate['user-id'],
                enabled: true,
            },
        ]));
    }
}

export function handleMarqueeDelete(id: string): void {
    if (settings.marquees.some(m => m.id === id)) {
        setSetting(null, 'marquees', settings.marquees.filter(m => m.id !== id));
    }
    if (settings.marqueesOnce.some(m => m.id === id)) {
        setSetting(null, 'marqueesOnce', settings.marqueesOnce.filter(m => m.id !== id));
    }
}

export function handleMarqueeBan(user: string): void {
    if (settings.marquees.some(m => m.user === user)) {
        setSetting(null, 'marquees', settings.marquees.filter(m => m.user !== user));
    }
    if (settings.marqueesOnce.some(m => m.user === user)) {
        setSetting(null, 'marqueesOnce', settings.marqueesOnce.filter(m => m.user !== user));
    }
}