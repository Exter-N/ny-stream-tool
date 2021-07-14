import { Array5 } from "../types";

// transpose = 1 (ABCD → ADCB)
// flip u = 2 (ABCD → BADC)
// flip v = 4 (ABCD → DCBA)
// rotate 90° cw = 3 (ABCD → DABC)
// rotate 180° = 6 (ABCD → CDAB)
// rotate 90° ccw = 5 (ABCD → BCDA)

export function transformCorners<T>(uvs: Array5<T>, transform: number): Array5<T> {
    let [aUv, bUv, cUv, dUv, mUv] = uvs;
    if (transform & 1) {
        [bUv, dUv] = [dUv, bUv];
    }
    if (transform & 2) {
        [aUv, bUv] = [bUv, aUv];
        [cUv, dUv] = [dUv, cUv];
    }
    if (transform & 4) {
        [aUv, dUv] = [dUv, aUv];
        [bUv, cUv] = [cUv, bUv];
    }

    return [aUv, bUv, cUv, dUv, mUv];
}

export function untransformCorners<T>(uvs: Array5<T>, transform: number): Array5<T> {
    let [aUv, bUv, cUv, dUv, mUv] = uvs;
    if (transform & 4) {
        [aUv, dUv] = [dUv, aUv];
        [bUv, cUv] = [cUv, bUv];
    }
    if (transform & 2) {
        [aUv, bUv] = [bUv, aUv];
        [cUv, dUv] = [dUv, cUv];
    }
    if (transform & 1) {
        [bUv, dUv] = [dUv, bUv];
    }

    return [aUv, bUv, cUv, dUv, mUv];
}