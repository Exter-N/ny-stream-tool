export default class Transition<TParams extends any[]> {
    private readonly frames: number;
    private readonly fn: (progress: number, ...params: TParams) => void;
    private readonly frameTime: number;
    private interval: NodeJS.Timeout | undefined;

    constructor(frames: number, fn: (progress: number, ...params: TParams) => void, frameTime: number = 1000 / 30) {
        this.frames = frames;
        this.fn = fn;
        this.frameTime = frameTime;
        this.interval = undefined;
    }

    start(...params: TParams): void {
        if (null != this.interval) {
            clearInterval(this.interval);
        }
        let i = 0;
        this.interval = setInterval(() => {
            const frame = ++i;
            if (i >= this.frames) {
                clearInterval(this.interval!);
                this.interval = undefined;
            }
            this.fn(frame / this.frames, ...params);
        }, this.frameTime);
        this.fn(0, ...params);
    }

    stop(): void {
        if (null != this.interval) {
            clearInterval(this.interval);
        }
        this.interval = undefined;
    }

    static debounce<TParams extends any[]>(time: number, fn: (...params: TParams) => void): Transition<TParams> {
        return new Transition(1, (progress, ...params) => {
            if (1 === progress) {
                fn(...params);
            }
        }, time);
    }
}