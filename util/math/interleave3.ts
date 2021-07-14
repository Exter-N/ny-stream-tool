// [z1][y1][x1]
export function interleave1x3(x: number, y?: number, z?: number): number {
    return (null == y || null == z) ? (x & 0x7) : ((x & 1) | ((y & 1) << 1) | ((z & 1) << 2));
}

export function deinterleave1x3(n: number): number {
    return n & 0x7;
}

// [z1  z0][y1  y0][x1  x0]
// [z1][y1][x1][z0][y0][x0]
export function interleave2x3(x: number, y?: number, z?: number): number {
    let n = (null == y || null == z) ? (x & 0x3F) : ((x & 0x3) | ((y & 0x3) << 2) | ((z & 0x3) << 4));
    n = (n & 0o41) | ((n & 0o02) << 2) | ((n & 0o10) << 1) | ((n & 0o04) >> 1) | ((n & 0o20) >> 2);

    return n;
}

export function deinterleave2x3(n: number): number {
    n &= 0x3F;
    n = (n & 0o41) | ((n & 0o04) << 2) | ((n & 0o02) << 1) | ((n & 0o20) >> 1) | ((n & 0o10) >> 2);

    return n;
}

// [z3  z2  z1  z0][y3  y2  y1  y0][x3  x2  x1  x0]
// [z3  z2][y3  y2][x3  x2][z1  z0][y1  y0][x1  x0]
// [z3][y3][x3][z2][y2][x2][z1][y1][x1][z0][y0][x0]
export function interleave4x3(x: number, y?: number, z?: number): number {
    let n = (null == y || null == z) ? (x & 0xFFF) : ((x & 0xF) | ((y & 0xF) << 4) | ((z & 0xF) << 8));
    n = (n & 0o6003) | ((n & 0o0014) << 4) | ((n & 0o0300) << 2) | ((n & 0o0060) >> 2) | ((n & 0o1400) >> 4);
    n = (n & 0o4141) | ((n & 0o0202) << 2) | ((n & 0o1010) << 1) | ((n & 0o0404) >> 1) | ((n & 0o2020) >> 2);

    return n;
}

export function deinterleave4x3(n: number): number {
    n &= 0xFFF;
    n = (n & 0o4141) | ((n & 0o0404) << 2) | ((n & 0o0202) << 1) | ((n & 0o2020) >> 1) | ((n & 0o1010) >> 2);
    n = (n & 0o6003) | ((n & 0o0060) << 4) | ((n & 0o0014) << 2) | ((n & 0o1400) >> 2) | ((n & 0o0300) >> 4);

    return n;
}

// [z7  z6  z5  z4  z3  z2  z1  z0][y7  y6  y5  y4  y3  y2  y1  y0][x7  x6  x5  x4  x3  x2  x1  x0]
// [z7  z6  z5  z4][y7  y6  y5  y4][x7  x6  x5  x4][z3  z2  z1  z0][y3  y2  y1  y0][x3  x2  x1  x0]
// [z7  z6][y7  y6][x7  x6][z5  z4][y5  y4][x5  x4][z3  z2][y3  y2][x3  x2][z1  z0][y1  y0][x1  x0]
// [z7][y7][x7][z6][y6][x6][z5][y5][x5][z4][y4][x4][z3][y3][x3][z2][y2][x2][z1][y1][x1][z0][y0][x0]
export function interleave8x3(x: number, y?: number, z?: number): number {
    let n = (null == y || null == z) ? (x & 0xFFFFFF) : ((x & 0xFF) | ((y & 0xFF) << 8) | ((z & 0xFF) << 16));
    n = (n & 0o74000017) | ((n & 0o00000360) << 8) | ((n & 0o00170000) << 4) | ((n & 0o00007400) >> 4) | ((n & 0o03600000) >> 8);
    n = (n & 0o60036003) | ((n & 0o00140014) << 4) | ((n & 0o03000300) << 2) | ((n & 0o00600060) >> 2) | ((n & 0o14001400) >> 4);
    n = (n & 0o41414141) | ((n & 0o02020202) << 2) | ((n & 0o10101010) << 1) | ((n & 0o04040404) >> 1) | ((n & 0o20202020) >> 2);

    return n;
}

export function deinterleave8x3(n: number): number {
    n &= 0xFFFFFF;
    n = (n & 0o41414141) | ((n & 0o04040404) << 2) | ((n & 0o02020202) << 1) | ((n & 0o20202020) >> 1) | ((n & 0o10101010) >> 2);
    n = (n & 0o60036003) | ((n & 0o00600060) << 4) | ((n & 0o00140014) << 2) | ((n & 0o14001400) >> 2) | ((n & 0o03000300) >> 4);
    n = (n & 0o74000017) | ((n & 0o00007400) << 8) | ((n & 0o00000360) << 4) | ((n & 0o03600000) >> 4) | ((n & 0o00170000) >> 8);

    return n;
}

// [z9  z8  z7  z6  z5  z4  z3  z2  z1  z0][y9  y8  y7  y6  y5  y4  y3  y2  y1  y0][x9  x8  x7  x6  x5  x4  x3  x2  x1  x0]
// [z9  z8][y9  y8][x9  x8][z7  z6  z5  z4  z3  z2  z1  z0][y7  y6  y5  y4  y3  y2  y1  y0][x7  x6  x5  x4  x3  x2  x1  x0]
// [z9  z8][y9  y8][x9  x8][z7  z6  z5  z4][y7  y6  y5  y4][x7  x6  x5  x4][z3  z2  z1  z0][y3  y2  y1  y0][x3  x2  x1  x0]
// [z9  z8][y9  y8][x9  x8][z7  z6][y7  y6][x7  x6][z5  z4][y5  y4][x5  x4][z3  z2][y3  y2][x3  x2][z1  z0][y1  y0][x1  x0]
// [z9][y9][x9][z8][y8][x8][z7][y7][x7][z6][y6][x6][z5][y5][x5][z4][y4][x4][z3][y3][x3][z2][y2][x2][z1][y1][x1][z0][y0][x0]
export function interleave10x3(x: number, y?: number, z?: number): number {
    let n = (null == y || null == z) ? (x & 0x3FFFFFFF) : ((x & 0x3FF) | ((y & 0x3FF) << 10) | ((z & 0x3FF) << 20));
    n = (n & 0x300000FF) | ((n & 0x00000300) << 16) | ((n & 0x000C0000) << 8) | ((n & 0x0003FC00) >> 2) | ((n & 0x0FF00000) >> 4);
    n = (n & 0o7774000017) | ((n & 0o0000000360) << 8) | ((n & 0o0000170000) << 4) | ((n & 0o0000007400) >> 4) | ((n & 0o0003600000) >> 8);
    n = (n & 0o7760036003) | ((n & 0o0000140014) << 4) | ((n & 0o0003000300) << 2) | ((n & 0o0000600060) >> 2) | ((n & 0o0014001400) >> 4);
    n = (n & 0o4141414141) | ((n & 0o0202020202) << 2) | ((n & 0o1010101010) << 1) | ((n & 0o0404040404) >> 1) | ((n & 0o2020202020) >> 2);

    return n;
}

export function deinterleave10x3(n: number): number {
    n &= 0x3FFFFFFF;
    n = (n & 0o4141414141) | ((n & 0o0404040404) << 2) | ((n & 0o0202020202) << 1) | ((n & 0o2020202020) >> 1) | ((n & 0o1010101010) >> 2);
    n = (n & 0o7760036003) | ((n & 0o0000600060) << 4) | ((n & 0o0000140014) << 2) | ((n & 0o0014001400) >> 2) | ((n & 0o0003000300) >> 4);
    n = (n & 0o7774000017) | ((n & 0o0000007400) << 8) | ((n & 0o0000000360) << 4) | ((n & 0o0003600000) >> 4) | ((n & 0o0000170000) >> 8);
    n = (n & 0x300000FF) | ((n & 0x00FF0000) << 4) | ((n & 0x0000FF00) << 2) | ((n & 0x0C000000) >> 8) | ((n & 0x03000000) >> 16);

    return n;
}