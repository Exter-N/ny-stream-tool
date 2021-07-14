import Transition from './transition';
import DataElement from './data';
import { getBlankSettings, Settings } from '../../common/settings';
import MulticastCallback from '../../util/multicast-callback';

const element = new DataElement<Settings>('settings', settings => Object.assign(getBlankSettings(), settings ?? { }));

const settings = element.read();

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

    return onChange!.delete(fn as any);
}

const saver = Transition.debounce(300, () => {
    console.log('Saving settings');
    element.write(settings);
});

export function saveSettings(): void {
    saver.start();
}

export default settings;