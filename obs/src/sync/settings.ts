import { rpc } from "./ws";
import { getBlankSettings, Settings } from "../../../common/settings";
import { NamedEntry } from "../../../common/ws-protocol";
import MulticastCallback from "../../../util/multicast-callback";

const settings: Settings = getBlankSettings();

export const settingsOnChange: { [K in keyof Settings]?: MulticastCallback<[value: Settings[K]]>; } = {
};

export function settingsAddOnChange<K extends keyof Settings>(key: K, fn: (value: Settings[K]) => void, runImmediately: boolean = false): void {
    if (null == settingsOnChange[key]) {
        settingsOnChange[key] = new MulticastCallback<[any]>();
    }

    settingsOnChange[key]!.add(fn as any);
    if (runImmediately) {
        fn(settings[key]);
    }
}

export function settingsRemoveOnChange<K extends keyof Settings>(key: K, fn: (value: Settings[K]) => void): boolean {
    const onChange = settingsOnChange[key];
    if (null == onChange) {
        return false;
    }

    return onChange.delete(fn as any);
}

export function settingsTriggerOnChange<K extends keyof Settings>(key: K): void {
    const value = settings[key];
    rpc('setSetting', { key, value } as NamedEntry<Settings>);
    (settingsOnChange[key] as MulticastCallback<[any]>)?.call(value);
}

export function setSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
    settings[key] = value;
    rpc('setSetting', { key, value } as NamedEntry<Settings>);
    (settingsOnChange[key] as MulticastCallback<[any]>)?.call(value);
}

export function setSettings(changes: Partial<Settings>): void {
    Object.assign(settings, changes);
    rpc('setSettings', changes);
    (Object.getOwnPropertyNames(changes) as (keyof Settings)[]).forEach(key => {
        (settingsOnChange[key] as MulticastCallback<[any]>)?.call(changes[key]);
    });
}

export default settings;