import { autoWebSocket, onWebSocketReady } from "../../../util/ws";
import settings, { settingsOnChange } from "./settings";
import { Settings } from "../../../common/settings";
import { Message, ClientToServer, ServerToClient } from "../../../common/ws-protocol";
import { sounds, soundsTriggerOnChange } from "./sounds";
import api from "../api";
import MulticastCallback from "../../../util/multicast-callback";

const ws = autoWebSocket('ws://' + location.hostname + ':9243/', undefined, ws => {
    ws.addEventListener('message', ev => {
        const msg = JSON.parse(ev.data) as Message<ServerToClient>;
        switch (msg.method) {
            case 'setSettings':
                Object.assign(settings, msg.params);
                (Object.getOwnPropertyNames(msg.params) as (keyof Settings)[]).forEach(key => {
                    (settingsOnChange[key] as MulticastCallback<[any]>)?.call(msg.params[key]);
                });
                break;
            case 'setSetting':
                (settings as any)[msg.params.key] = msg.params.value;
                (settingsOnChange[msg.params.key] as MulticastCallback<[any]>)?.call(msg.params.value);
                break;
            case 'setSounds':
                sounds.length = 0;
                sounds.push(...msg.params.sounds);
                soundsTriggerOnChange();
                break;
            case 'status':
                console.log('Status', msg.params);
                break;
        }
    });

    const state: ClientToServer['setState'] = {
        agent: 'app',
    };

    (async function () {
        await onWebSocketReady(ws);

        ws.send(JSON.stringify({ method: 'setState', params: state }));
    })();
});

ws();
setInterval(() => ws(), 5000);

export function rpc<M extends keyof ClientToServer>(method: M, params: ClientToServer[M]): void {
    ws()!.send(JSON.stringify({ method, params }));
}

api?.addEventListener('server.stdout', data => {
    if (data.includes('Server started')) {
        ws();
    }
});

Object.assign(window as any, {
    rpc,
});

export default ws;