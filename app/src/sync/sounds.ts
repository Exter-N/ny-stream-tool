import MulticastCallback from "../../../util/multicast-callback";

export const sounds: string[] = [];

const onChange = new MulticastCallback<[value: string[]]>();

export function soundsAddOnChange(fn: (value: string[]) => void, runImmediately: boolean = false): void {
    onChange.add(fn);
    if (runImmediately) {
        fn(sounds);
    }
}

export function soundsRemoveOnChange(fn: (value: string[]) => void): boolean {
    return onChange.delete(fn);
}

export function soundsTriggerOnChange(): void {
    onChange.call(sounds);
}