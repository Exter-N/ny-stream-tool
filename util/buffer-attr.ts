import { BufferAttribute } from "three";

export type TypedBufferAttribute<T extends ArrayLike<number>> = BufferAttribute & { array: T; };

export function createBufferAttribute<T extends ArrayLike<number>>(array: T, itemSize: number, initializeItem?: (array: T, index: number) => void): TypedBufferAttribute<T> {
    const length = array.length;
    if (0 !== (length % itemSize)) {
        throw new Error('Invalid ' + array.constructor.name + ' of length ' + length + ' for attribute of item size ' + itemSize);
    }
    if (null != initializeItem) {
        for (let i = 0; i < length; i += itemSize) {
            initializeItem(array, i);
        }
    }

    return new BufferAttribute(array, itemSize) as TypedBufferAttribute<T>;
}