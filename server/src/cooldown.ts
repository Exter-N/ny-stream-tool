export class Cooldown {
    readonly ms: number;
    last: number;
    constructor(ms: number) {
        this.ms = ms;
        this.last = -Infinity;
    }
    activate(): boolean {
        const now = Date.now();
        if (now - this.last >= this.ms) {
            this.last = now;

            return true;
        } else {
            return false;
        }
    }
}

export class KeyedCooldown<K> {
    readonly ms: number;
    readonly last: Map<K, number>;
    constructor(ms: number) {
        this.ms = ms;
        this.last = new Map();
    }
    activate(key: K): boolean {
        const now = Date.now();
        if (now - (this.last.get(key) ?? -Infinity) >= this.ms) {
            this.last.set(key, now);

            return true;
        } else {
            return false;
        }
    }
}