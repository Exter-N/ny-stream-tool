import { arrayBinarySearchKey } from './array';

type RangeMapInterpolation<K, V> = (key: K, lowerKey: K, upperKey: K, lowerValue: V, upperValue: V, upperIndex: number, array: [K, V][], map: RangeMap<K, V>) => V;

interface RangeMapQueryResult<K, V> {
    key: K;
    value: V;
    exact: boolean;
    lowerKey: K;
    upperKey: K;
    lowerValue: V;
    upperValue: V;
}

export default class RangeMap<K, V> implements Map<K, V> {
    private readonly array: [K, V][];
    readonly interpolate: RangeMapInterpolation<K, V>;
    readonly compareKeys: ((x: K, y: K) => number) | undefined;

    [Symbol.toStringTag]: string;

    constructor(interpolate: RangeMapInterpolation<K, V>, compareKeys?: (x: K, y: K) => number, entries?: Iterable<readonly [K, V]>) {
        this.array = [];
        this.interpolate = interpolate;
        this.compareKeys = compareKeys;
        if (null != entries) {
            for (const [k, v] of entries) {
                this.set(k, v);
            }
        }
    }

    get size(): number {
        return this.array.length;
    }

    private indexOf(key: K): number {
        return arrayBinarySearchKey(this.array, key, e => e[0], this.compareKeys);
    }
    clear(): void {
        this.array.length = 0;
    }
    delete(key: K): boolean {
        const i = this.indexOf(key);
        if (i < 0) {
            return false;
        }

        this.array.splice(i, 1);

        return true;
    }
    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
        for (const [k, v] of this.array.slice()) {
            callbackfn.call(thisArg, v, k, this);
        }
    }
    get(key: K): V | undefined {
        return this.query(key)?.value;
    }
    query(key: K): RangeMapQueryResult<K, V> | undefined {
        const i = this.indexOf(key);
        if (i >= 0) {
            const value = this.array[i][1];

            return {
                key,
                value,
                exact: true,
                lowerKey: key,
                upperKey: key,
                lowerValue: value,
                upperValue: value,
            };
        }

        const upperI = ~i;
        if (upperI < 1 || upperI >= this.array.length) {
            return undefined;
        }

        const lower = this.array[upperI - 1];
        const upper = this.array[upperI];

        return {
            key,
            value: this.interpolate(key, lower[0], upper[0], lower[1], upper[1], upperI, this.array, this),
            exact: false,
            lowerKey: lower[0],
            upperKey: upper[0],
            lowerValue: lower[1],
            upperValue: upper[1],
        };
    }
    has(key: K): boolean {
        return this.indexOf(key) >= 0;
    }
    set(key: K, value: V): this {
        const i = this.indexOf(key);
        if (i >= 0) {
            this.array[i][1] = value;
        } else {
            this.array.splice(~i, 0, [key, value]);
        }

        return this;
    }
    entries(): IterableIterator<[K, V]> {
        return this.array.slice()[Symbol.iterator]();
    }
    keys(): IterableIterator<K> {
        return this.array.map(e => e[0])[Symbol.iterator]();
    }
    values(): IterableIterator<V> {
        return this.array.map(e => e[1])[Symbol.iterator]();
    }
    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.array.slice()[Symbol.iterator]();
    }

}

RangeMap.prototype[Symbol.toStringTag] = "RangeMap";