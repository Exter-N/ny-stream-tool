import ObsWebSocket from 'obs-websocket-js';
import { addStopHandler } from '../stop';
import { status, currentStatus } from '../ws';

const socket = new ObsWebSocket();

let readyPromise: Promise<void> | undefined;
let resolveReady: (() => void) | undefined;
let connecting = false;

export function ready(): Promise<void> {
    if (null == readyPromise) {
        return Promise.reject(new Error('OBS WebSocket ready promise not initialized'));
    }

    return readyPromise;
}

export function isReady(): boolean {
    return null == resolveReady;
}

function rearmReady(): void {
    if (resolveReady) {
        return;
    }

    readyPromise = new Promise(resolve => {
        resolveReady = resolve;
    });
}

rearmReady();

async function connect(): Promise<void> {
    if (connecting || !resolveReady) {
        return;
    }
    const resolve = resolveReady;

    connecting = true;
    try {
        try {
            await socket.connect({
                address: process.env.OBS_ADDRESS,
                password: process.env.OBS_PASSWORD,
            });

            status(null, {
                obsConnected: true,
            });
            resolveReady = undefined;
            resolve();
        } catch (e) {
            // This block intentionally left blank.
        }
    } finally {
        connecting = false;
    }
}

connect();

const reconnect = setInterval(connect, 5000);

addStopHandler(() => {
    clearInterval(reconnect);
    socket.disconnect();
});

socket.on('ConnectionClosed', () => {
    if (currentStatus.obsConnected) {
        status(null, {
            obsConnected: false,
        });
    }
    rearmReady();
});

export default socket;