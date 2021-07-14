import { Settings } from "./settings";

export type NamedEntry<T> = {
    [K in keyof T]: { key: K, value: T[K] };
}[keyof T];

export interface Bidirectional {
    setSetting: NamedEntry<Settings>;
    setSettings: Partial<Settings>;
    playSound: {
        name: string;
    };
    reload: { };
}

export interface ClientToServer extends Bidirectional {
    refreshRewards: { };
    refreshSounds: { };
    refreshRoles: { };
    refreshFFZBots: { };
    refreshFFZEmotes: { };
    refreshFFZRoom: { };
    setState: {
        agent?: string;
        isObs?: boolean;
    };
    startChromaTransition: {
        a: number;
        b: number;
    };
    stop: {
        graceful: boolean;
        reason: string | null;
        detail: any;
    };
}

export interface ServerToClient extends Bidirectional {
    setSounds: {
        sounds: string[];
    };
    triggerPyramid: { };
    status: {
        obsConnected?: boolean;
        overlayConnected?: boolean;
    };
}

export type Message<T> = {
    [K in keyof T]: { method: K, params: T[K] };
}[keyof T];