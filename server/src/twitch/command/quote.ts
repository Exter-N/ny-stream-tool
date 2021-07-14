import anyAscii from "any-ascii";
import { ChatUserstate } from "tmi.js";
import { Message, messageSplitFirstWord, messageToString } from "../../../../common/chat-message";
import { Quote } from "../../../../common/settings";
import { randomElement } from "../../../../util/array";
import regExpEscape from "../../../../util/regexp-escape";
import settings from "../../settings";
import { setSetting, setSettings } from "../../ws";
import PublicError, { PublicAccessDeniedError } from "../public-error";

export function addQuote(userstate: ChatUserstate, message: Message): string {
    if (!userstate.badges?.broadcaster && !userstate.badges?.moderator && !userstate.badges?.vip) {
        throw new PublicAccessDeniedError();
    }

    const [author, quote] = messageSplitFirstWord(message, true);
    if (null == quote) {
        throw new PublicError('C\'est pas comme ça qu\'on fait ! Exemples : !q+ Navi Hey! Listen!, !q+ - Le lundi est à l\'origine de tous les maux.');
    }
    const authorStr = messageToString(author);
    const q: Quote = {
        id: settings.nextQuoteId,
        quote: messageToString(quote),
        enabled: true,
    };
    if ('*' !== authorStr && '-' !== authorStr) {
        q.author = authorStr;
    }
    settings.quotes.push(q);

    setSettings(null, {
        nextQuoteId: q.id + 1,
        quotes: settings.quotes,
    });

    return 'Accueillons ensemble la nouvelle citation #' + q.id + ', merci ' + userstate['display-name'] + ' !';
}

export function editQuote(userstate: ChatUserstate, message: Message): string {
    if (!userstate.badges?.broadcaster && !userstate.badges?.moderator && !userstate.badges?.vip) {
        throw new PublicAccessDeniedError();
    }

    const [idM, args] = messageSplitFirstWord(message);
    const id = Number(messageToString(idM));
    if (isNaN(id) || null == args) {
        throw new PublicError('C\'est pas comme ça qu\'on fait ! Exemple : !q= 123 Navi Watch out!');
    }

    const q = settings.quotes.find(q => q.enabled && q.id === id);
    if (null == q) {
        throw new PublicError('La citation #' + id + ' n\'a pas été trouvée.');
    }

    const [authorM, quoteM] = messageSplitFirstWord(args, true);
    const author = messageToString(authorM);
    if ('*' !== author) {
        if ('-' === author) {
            delete q.author;
        } else {
            q.author = author;
        }
    }
    if (null != quoteM) {
        const quote = messageToString(quoteM);
        if ('*' !== quote) {
            q.quote = quote;
        }
    }

    setSetting(null, 'quotes', settings.quotes);

    return 'Toute belle, toute fraîche, la citation #' + q.id + ' fait peau neuve !';
}

export function deleteQuote(userstate: ChatUserstate, message: Message): string {
    if (!userstate.badges?.broadcaster && !userstate.badges?.moderator && !userstate.badges?.vip) {
        throw new PublicAccessDeniedError();
    }

    const [idM] = messageSplitFirstWord(message);
    const id = Number(messageToString(idM));

    const q = settings.quotes.find(q => q.enabled && q.id === id);
    if (null == q) {
        throw new PublicError('La citation #' + id + ' n\'a pas été trouvée.');
    }

    q.enabled = false;
    setSetting(null, 'quotes', settings.quotes);

    return 'La citation #' + q.id + ' est le maillon faible. Au revoir !';
}

function formatQuote(quote: Quote): string {
    return '#' + quote.id + ' : « ' + quote.quote + ' »' + (quote.author ? (' – ' + quote.author) : '');
}

function queryQuote(subVerb: string): string {
    if (subVerb) {
        const id = Number(subVerb);
        if (!isNaN(id)) {
            const quote = settings.quotes.find(q => q.enabled && q.id === id);
            if (null != quote) {
                return formatQuote(quote);
            } else {
                throw new PublicError('La citation #' + id + ' n\'a pas été trouvée.');
            }
        } else {
            const re = new RegExp('\\b' + regExpEscape(subVerb) + '\\b');
            const quote = randomElement(settings.quotes.filter(q => q.enabled && re.test(anyAscii(q.quote).toLowerCase())));
            if (null != quote) {
                return formatQuote(quote);
            } else {
                throw new PublicError('Aucune citation trouvée contenant "' + subVerb + '".');
            }
        }
    } else {
        const quote = randomElement(settings.quotes.filter(q => q.enabled));
        if (null != quote) {
            return formatQuote(quote);
        } else {
            throw new PublicError('Aucune citation trouvée.');
        }
    }
}

export function quote(userstate: ChatUserstate, message: Message): string {
    const [firstWord, rest] = messageSplitFirstWord(message);
    const subVerb = anyAscii(messageToString(firstWord)).toLowerCase();
    switch (subVerb) {
        case '+':
        case 'a':
        case 'add':
        case 'ajout':
        case 'ajouter':
            return addQuote(userstate, rest ?? '');
        case '=':
        case 'e':
        case 'c':
        case 'm':
        case 'edit':
        case 'change':
        case 'ch':
        case 'chg':
        case 'replace':
        case 'mod':
        case 'modif':
        case 'editer':
        case 'changer':
        case 'modifier':
        case 'remplacer':
            return editQuote(userstate, rest ?? '');
        case '-':
        case 'd':
        case 'rm':
        case 'del':
        case 'delete':
        case 'suppr':
        case 'supprimer':
            return deleteQuote(userstate, rest ?? '');
        default:
            return queryQuote(subVerb);
    }
}