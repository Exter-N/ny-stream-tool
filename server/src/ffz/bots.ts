import fetch from 'node-fetch';
import DataElement from '../data';

const element = new DataElement<string[]>('ffz-bots', bots => bots ?? [ ]);

async function getBots(): Promise<string[]> {
    const response = await fetch('https://api.frankerfacez.com/v1/badge/2');
    const data = await response.json();

    return data.users[2];
}

export async function refreshBots(): Promise<void> {
    const newBots = await getBots();
    bots.length = 0;
    bots.push(...newBots);
    bots.sort();
    element.write(bots);
}

const bots = element.read();

if (0 === bots.length) {
    refreshBots();
}

export default bots;