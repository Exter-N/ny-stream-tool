const hasOwnProperty = Object.prototype.hasOwnProperty;

export function objectShallowEquals(obj1: any, obj2: any): boolean {
    const keys = Object.getOwnPropertyNames(obj1);

    if (Object.getOwnPropertyNames(obj2).length !== keys.length) {
        return false;
    }

    for (const key of keys) {
        if (!hasOwnProperty.call(obj2, key)) {
            return false;
        }

        if (obj1[key] !== obj2[key]) {
            return false;
        }
    }

    return true;
}