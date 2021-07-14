export function saturate(x: number): number {
    return Math.max(0, Math.min(1, x));
}