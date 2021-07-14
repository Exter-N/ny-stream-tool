import fetch from 'node-fetch';
import DataElement from '../data';
import { DefaultSetData } from './schema';

const element = new DataElement<DefaultSetData>('ffz-emotes', emotes => emotes ?? ({ } as any));

async function getEmotes(): Promise<DefaultSetData> {
    const response = await fetch('https://api.frankerfacez.com/v1/set/global');

    return await response.json();
}

export async function refreshEmotes(): Promise<void> {
    const newEmotes = await getEmotes();
    Object.assign(emotes, newEmotes);
    element.write(emotes);
}

const emotes = element.read();

if (!('default_sets' in emotes)) {
    refreshEmotes();
}

export default emotes;