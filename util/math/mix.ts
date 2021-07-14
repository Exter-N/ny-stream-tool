export function mix(x: number, y: number, a: number): number {
    return x + a * (y - x);
}

export function unmix(x: number, y: number, r: number): number {
    return (r - x) / (y - x);
}

export function mixIntersect(x1: number, y1: number, x2: number, y2: number): number {
    return (x1 - x2) / (x1 - y1 - x2 + y2);
}