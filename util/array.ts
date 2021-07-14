export function arrayDelete<T>(array: T[], element: T): boolean {
    const i = array.indexOf(element);
    if (i < 0) {
        return false;
    }

    array.splice(i, 1);

    return true;
}

export function arrayDeleteFound<T>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean): { deleted: false; } | { deleted: true; element: T; } {
    const i = array.findIndex(predicate);
    if (i < 0) {
        return { deleted: false };
    }

    const element = array[i];
    array.splice(i, 1);

    return { deleted: true, element };
}

export function randomElement<T>(array: T[]): T | undefined {
    switch (array.length) {
        case 0:
            return undefined;
        case 1:
            return array[0];
        default:
            return array[Math.floor(Math.random() * array.length)];
    }
}