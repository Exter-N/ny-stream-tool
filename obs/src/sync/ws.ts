import { isObs } from "../obs";
import { autoWebSocket, onWebSocketReady } from "../../../util/ws";
import settings, { settingsOnChange } from "./settings";
import { Settings } from "../../../common/settings";
import { Message, ClientToServer, ServerToClient } from "../../../common/ws-protocol";
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
            case 'playSound':
                if (isObs) {
                    const audio = document.createElement('audio');
                    audio.classList.add('hidden');
                    audio.src = 'sounds/' + msg.params.name;
                    document.body.appendChild(audio);
                    audio.play();
                    audio.addEventListener('ended', () => {
                        document.body.removeChild(audio);
                    }, false);
                }
                break;
            case 'reload':
                location.reload();
                break;
        }
    });

    const state: ClientToServer['setState'] = {
        agent: 'overlay',
        isObs,
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

export default ws;