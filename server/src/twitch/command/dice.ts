import { getUserByName } from "../../users";
import Dice from "../../../../util/dice";
import PublicError from "../public-error";

const d = new Dice();

function parseDice(query: string): [number, number] | null {
    const parts = query.split(/d/gi).map(part => Number(part.trim()));
    if (parts.some(n => isNaN(n) || n < 1)) {
        return null;
    }

    let result: [number, number];
    switch (parts.length) {
        case 1:
            result = [1, parts[0]];
            break;
        case 2:
            result = parts as [number, number];
            break;
        default:
            return null;
    }
    if (result[1] < 2) {
        return null;
    }

    return result;
}

export function dice(displayName: string, query: string): string {
    const parsedQuery = parseDice(query);
    if (null == parsedQuery) {
        throw new PublicError('C\'est pas comme ça qu\'on fait ! Exemples : !dé, !dé 20, !dé 3d6');
    }

    const [numDice, numSides] = parsedQuery;
    if (numDice > 10) {
        throw new PublicError('Je n\'ai que 10 dés dans ma boîte !');
    }
    if (numSides > 1000) {
        throw new PublicError('Je n\'ai pas de dés à plus de 1000 faces !');
    }

    let result = 0;
    let detail: number[] = [];
    for (let i = 0; i < numDice; ++i) {
        const die = d.roll(numSides);
        result += die;
        detail.push(die);
    }

    return displayName + ' lance ' + numDice + 'd' + numSides + ' et obtient ' + result + ' !' + ((numDice > 1) ? (' (' + detail.join(', ') + ')') : '');
}