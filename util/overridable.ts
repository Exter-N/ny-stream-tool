import { arrayDelete } from "./array";

export interface OverrideLayer<T> {
    value: T;
}

export default class Overridable<T> {
    private readonly layers: OverrideLayer<T>[];

    constructor(baseValue: T) {
        this.layers = [ { value: baseValue } ];
    }

    get baseValue(): T {
        return this.layers[0].value;
    }
    set baseValue(value: T) {
        this.layers[0].value = value;
    }

    get value(): T {
        return this.layers[this.layers.length - 1].value;
    }

    add(layer: OverrideLayer<T>): void {
        this.layers.push(layer);
    }
    delete(layer: OverrideLayer<T>): boolean {
        return arrayDelete(this.layers, layer);
    }
}