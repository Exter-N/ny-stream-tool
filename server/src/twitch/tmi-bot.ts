import * as tmi from 'tmi.js';
import { addStopHandler } from '../stop';

const client = new tmi.client({
    identity: {
        username: process.env.BOT_USERNAME!,
        password: process.env.BOT_TMI_TOKEN!,
    },
    channels: [
        process.env.CHANNEL!,
    ],
    connection: {
        reconnect: true,
        secure: true,
    },
    options: {
    },
});

addStopHandler(async () => {
    await client.disconnect();
});

client.connect();

export default client;