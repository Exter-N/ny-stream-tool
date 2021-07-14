import { IncomingMessage } from 'http';
import { readdirSync } from 'fs';
import { join } from 'path';
import WebSocket from 'ws';
import { Settings } from '../../common/settings';
import { refreshBots } from './ffz/bots';
import server from './server';
import settings, { settingsOnChange, saveSettings } from './settings';
import { addStopHandler, stop } from './stop';
import { refreshRewards } from './twitch/rewards';
import { Message, ClientToServer, ServerToClient, NamedEntry } from '../../common/ws-protocol';
import { startChromaTransition } from './twitch/command/color';
import { refreshRoom } from './ffz/room';
import { refreshEmotes } from './ffz/emotes';
import { resetFFZEmoteParser } from './twitch/message-parser';
import { refreshRoles } from './twitch/tmi-caster';
import MulticastCallback from '../../util/multicast-callback';

let overlayConnections = 0;

export const currentStatus: Required<ServerToClient['status']> = {
    obsConnected: false,
    overlayConnected: false,
};

class ClientState {
    agent: string | undefined;
    isObs: boolean;
    constructor() {
        this.agent = undefined;
        this.isObs = false;
    }
}

const wsServer = new WebSocket.Server({ server });
const wsClients = new Map<WebSocket, ClientState>();

export function broadcast(except: WebSocket | null, message: string): void {
    for (const ws of wsClients.keys()) {
        if (ws === except) {
            continue;
        }
        ws.send(message, err => {
            if (err) {
                console.error(err);
            }
        });
    }
}

export function rpc<M extends keyof ServerToClient>(ws: WebSocket, method: M, params: ServerToClient[M]): void {
    ws.send(JSON.stringify({ method, params }));
}

export function broadcastRpc<M extends keyof ServerToClient>(except: WebSocket | null, method: M, params: ServerToClient[M]): void {
    broadcast(except, JSON.stringify({ method, params }));
}

export function setSetting<K extends keyof Settings>(except: WebSocket | null, key: K, value: Settings[K]): void {
    settings[key] = value;
    (settingsOnChange[key] as MulticastCallback<[any]>)?.call(value);
    broadcastRpc(except, 'setSetting', { key, value } as NamedEntry<Settings>);
    saveSettings();
}

export function setSettings(except: WebSocket | null, changes: Partial<Settings>): void {
    Object.assign(settings, changes);
    (Object.getOwnPropertyNames(changes) as (keyof Settings)[]).forEach(key => {
        (settingsOnChange[key] as MulticastCallback<[any]>)?.call(changes[key]);
    });
    broadcastRpc(except, 'setSettings', changes);
    saveSettings();
}

export function playSound(except: WebSocket | null, name: string): void {
    broadcastRpc(except, 'playSound', { name });
}

export function reload(except: WebSocket | null): void {
    broadcastRpc(except, 'reload', { });
}

export function triggerPyramid(except: WebSocket | null): void {
    broadcastRpc(except, 'triggerPyramid', { });
}

export function status(except: WebSocket | null, status: ServerToClient['status']): void {
    Object.assign(currentStatus, status);
    broadcastRpc(except, 'status', status);
}

wsServer.on('connection', (ws: WebSocket, request: IncomingMessage) => {
    const state = new ClientState();

    ws.on('message', (message: string) => {
        try {
            const msg = JSON.parse(message) as Message<ClientToServer>;
            switch (msg.method) {
                case 'setSetting':
                    (settings as any)[msg.params.key] = msg.params.value;
                    (settingsOnChange[msg.params.key] as MulticastCallback<[any]>)?.call(msg.params.value);
                    saveSettings();
                    broadcast(ws, message);
                    break;
                case 'setSettings':
                    Object.assign(settings, msg.params);
                    (Object.getOwnPropertyNames(msg.params) as (keyof Settings)[]).forEach(key => {
                        (settingsOnChange[key] as MulticastCallback<[any]>)?.call(msg.params[key]);
                    });
                    saveSettings();
                    broadcast(ws, message);
                    break;
                case 'setState':
                    const wasObs = state.isObs;
                    Object.assign(state, msg.params);
                    if (state.isObs !== wasObs) {
                        if (state.isObs) {
                            if (++overlayConnections === 1) {
                                status(null, {
                                    overlayConnected: true,
                                });
                            }
                        } else {
                            if (--overlayConnections === 0) {
                                status(null, {
                                    overlayConnected: false,
                                });
                            }
                        }
                    }
                    break;
                case 'playSound':
                case 'reload':
                    broadcast(ws, message);
                    break;
                case 'refreshSounds':
                    rpc(ws, 'setSounds', {
                        sounds: readdirSync(join('obs', 'sounds')),
                    });
                    break;
                case 'refreshRoles':
                    refreshRoles();
                    break;
                case 'refreshRewards':
                    refreshRewards();
                    break;
                case 'refreshFFZBots':
                    refreshBots();
                    break;
                case 'refreshFFZEmotes':
                    refreshEmotes().then(resetFFZEmoteParser);
                    break;
                case 'refreshFFZRoom':
                    refreshRoom().then(resetFFZEmoteParser);
                    break;
                case 'startChromaTransition':
                    startChromaTransition(msg.params.a, msg.params.b);
                    break;
                case 'stop':
                    stop(msg.params);
                    break;
            }
        } catch (e) {
            console.error(e);
        }
    });

    ws.on('close', () => {
        wsClients.delete(ws);
        if (state.isObs) {
            if (--overlayConnections === 0) {
                status(null, {
                    overlayConnected: false,
                });
            }
        }
    });

    rpc(ws, 'setSettings', settings);
    rpc(ws, 'setSounds', {
        sounds: readdirSync(join('obs', 'sounds')),
    });
    rpc(ws, 'status', currentStatus);

    wsClients.set(ws, state);
});

const statusPurgeInterval = setInterval(() => {
    const effects = settings.statusEffects;
    const now = Date.now();
    const newEffects = effects.filter(fx => fx.notAfter >= now);
    if (newEffects.length < effects.length) {
        setSetting(null, 'statusEffects', newEffects);
    }
}, 60000);

addStopHandler(() => {
    clearInterval(statusPurgeInterval);
    for (const ws of wsClients.keys()) {
        ws.close();
    }
});