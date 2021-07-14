import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export default class DataElement<TLive, TStored = TLive> {
    readonly key: string;
    readonly hydrate: (data: TStored | undefined) => TLive;
    readonly dehydrate: ((data: TLive) => TStored) | undefined;
    constructor(key: string, hydrate: (data: TStored | undefined) => TLive, dehydrate?: ((data: TLive) => TStored) | undefined) {
        this.key = key;
        this.hydrate = hydrate;
        this.dehydrate = dehydrate;
    }
    read(): TLive {
        let stored;
        try {
            stored = JSON.parse(readFileSync(join('data', this.key + '.json'), { encoding: 'utf-8' }));
        } catch (e) {
            stored = undefined;
        }

        return this.hydrate(stored);
    }
    write(data: TLive): void {
        writeFileSync(join('data', this.key + '.json'), JSON.stringify((null != this.dehydrate) ? this.dehydrate(data) : data), { encoding: 'utf-8' });
    }
}