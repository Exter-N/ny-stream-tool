import settings, { settingsAddOnChange } from "../settings";
import { setSetting } from "../ws";
import socket, { isReady } from "./socket";

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const TIMER_NAME = 'LiveSplit Timer';

async function trySetTimerPosition(): Promise<boolean> {
    try {
        await socket.send('SetSceneItemPosition', {
            item: TIMER_NAME,
            x: CANVAS_WIDTH - (settings.avatar ? 188 : 8),
            y: CANVAS_HEIGHT,
        });

        return true;
    } catch (e) {
        return false;
    }
}

socket.on('AuthenticationSuccess', trySetTimerPosition);
socket.on('SwitchScenes', trySetTimerPosition);

socket.on('SceneItemTransformChanged', data => {
    if (data['item-name'] === TIMER_NAME) {
        let right = CANVAS_WIDTH - data.transform.position.x;
        if (data.transform.visible && (data.transform.sourceWidth > 1 || data.transform.sourceHeight > 1)) {
            right += data.transform.width + 8 - data.transform.crop.left - data.transform.crop.right;
        }
        setSetting(null, 'marqueesRight', right);
    }
});

settingsAddOnChange('avatar', async value => {
    if (isReady()) {
        await trySetTimerPosition();
    }
}, true);