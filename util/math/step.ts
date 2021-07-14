export function smoothstep(x: number): number {
    return x * x * (3.0 - 2.0 * x);
}

export function smootherstep(x: number): number {
    return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

export function inverseSmoothstep(x: number): number {
    return 0.5 - Math.sin(Math.asin(1.0 - 2.0 * x) / 3.0);
}

export function sinestep(x: number): number {
    return 0.5 - (Math.cos(x * Math.PI) * 0.5);
}