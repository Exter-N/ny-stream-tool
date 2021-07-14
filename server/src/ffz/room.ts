import fetch from 'node-fetch';
import DataElement from '../data';
import { RoomData } from './schema';

const element = new DataElement<RoomData>('ffz-room', room => room ?? ({ } as any));

async function getRoom(): Promise<RoomData> {
    const response = await fetch('https://api.frankerfacez.com/v1/room/id/' + Number(process.env.CHANNEL_ID!));

    return await response.json();
}

export async function refreshRoom(): Promise<void> {
    const newRoom = await getRoom();
    Object.assign(room, newRoom);
    element.write(room);
}

const room = element.read();

if (!('room' in room)) {
    refreshRoom();
}

export default room;