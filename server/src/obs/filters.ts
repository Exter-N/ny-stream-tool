import socket, { ready } from "./socket";
import { arrayDelete } from "../../../util/array";

let scene: string | undefined;
const sceneFilters: string[] = [];

async function tryToggleSourceFilter(source: string, filter: string, enable: boolean): Promise<boolean> {
    try {
        await socket.send('SetSourceFilterVisibility', {
            sourceName: source,
            filterName: filter,
            filterEnabled: enable,
        });

        return true;
    } catch (e) {
        return false;
    }
}

socket.on('SwitchScenes', async data => {
    const oldScene = scene;
    scene = data['scene-name'];

    const uniqueSceneFilters = [...new Set(sceneFilters)];
    if (null != oldScene) {
        for (const filter of uniqueSceneFilters) {
            await tryToggleSourceFilter(oldScene, filter, false);
        }
    }

    for (const filter of uniqueSceneFilters) {
        await tryToggleSourceFilter(scene, filter, true);
    }
});

socket.on('AuthenticationSuccess', async () => {
    const { name } = await socket.send('GetCurrentScene');
    scene = name;

    const uniqueSceneFilters = [...new Set(sceneFilters)];
    for (const filter of uniqueSceneFilters) {
        await tryToggleSourceFilter(scene, filter, true);
    }
});

export async function enableSceneFilter(filter: string): Promise<void> {
    const enable = !sceneFilters.includes(filter);
    sceneFilters.push(filter);

    if (enable && null != scene) {
        await ready();

        await tryToggleSourceFilter(scene, filter, true);
    }
}

export async function disableSceneFilter(filter: string): Promise<void> {
    if (arrayDelete(sceneFilters, filter) && !sceneFilters.includes(filter) && null != scene) {
        await ready();

        await tryToggleSourceFilter(scene, filter, false);
    }
}