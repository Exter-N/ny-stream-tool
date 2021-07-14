import { writeFileSync } from 'fs';
import { arrayDelete } from '../../util/array';

export interface AbortRequest {
    reason: string | null;
    detail: any;
}

export interface StopRequest extends AbortRequest {
    graceful: boolean;
}

type StopHandler = (request: StopRequest) => void | Promise<void>;

const handlers: StopHandler[] = [];

export function addStopHandler(handler: StopHandler): void {
    handlers.push(handler);
}

export function removeStopHandler(handler: StopHandler): boolean {
    return arrayDelete(handlers, handler);
}

export async function stop(request: StopRequest = { graceful: true, reason: null, detail: null }): Promise<never> {
    const promises: Promise<void>[] = [];
    for (const handler of handlers) {
        const p = handler(request);
        if (p instanceof Promise) {
            promises.push(p);
        }
    }

    if (promises.length > 0) {
        try {
            await Promise.all(promises);
        } catch (e) {
            process.exit(1);
        }
    }

    process.exit(request.graceful ? 0 : 1);
}

export async function abort(request: AbortRequest = { reason: null, detail: null }): Promise<never> {
    setTimeout(() => {
        process.exit(1);
    }, 3000);
    try {
        await stop(Object.assign({ }, request, { graceful: false }));
    } catch (e) {
        console.error(e);
    }

    process.exit(1);
}

export function crash(request: AbortRequest = { reason: null, detail: null }): Promise<never> {
    console.error(request.detail);
    try {
        writeFileSync('crash.log', request.reason + '\n' + request.detail + '\n');
    } catch (ex) {
        // don't log :(
    }

    return abort(request);
}
