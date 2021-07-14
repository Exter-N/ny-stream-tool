export interface ApiEvents {
    'server.spawn'(): void;
    'server.exit'(): void;
    'server.stdout'(data: string): void;
    'server.stderr'(data: string): void;
}

export interface Api {
    restartServer(): void;
    quit(): void;
    addEventListener<E extends keyof ApiEvents>(event: E, listener: ApiEvents[E]): void;
    removeEventListener<E extends keyof ApiEvents>(event: E, listener: ApiEvents[E]): boolean;
}

export default (window as any).api as (Api | undefined);