export function addN(a: number | null | undefined, b: number | null | undefined): number | null {
    if (null == a || null == b) {
        return null;
    }

    return a + b;
}