import { Message, messageToString } from "../../../../common/chat-message";

const RE_VARS = /\{(user|args|[1-9][0-9]+|ob|cb|u\+[0-9a-f]+)\}/gi;

export function staticCommand(template: string, user: string, args: Message): string {
    let textArgs: string | null = null;
    let words: string[] | null = null;

    return template.replace(RE_VARS, (_, key: string) => {
            key = key.toLowerCase();
            switch (key) {
                case 'user':
                    return user;
                case 'args':
                    if (null == textArgs) {
                        textArgs = messageToString(args ?? '');
                    }

                    return textArgs;
                case 'ob':
                    return '{';
                case 'cb':
                    return '}';
                default:
                    if (key.startsWith('u+')) {
                        return String.fromCodePoint(parseInt(key.substr(2), 16));
                    } else {
                        if (null == textArgs) {
                            textArgs = messageToString(args ?? '');
                        }
                        if (null == words) {
                            words = textArgs.split(/\s+/g);
                        }

                        return words[Number(key) - 1] ?? '';
                    }
            }
        });
}