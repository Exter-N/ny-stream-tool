// [y1][x1]
export function interleave1x2(x: number, y?: number): number {
    return (null == y) ? (x & 3) : ((x & 1) | ((y & 1) << 1));
}

export function deinterleave1x2(n: number): number {
    return n & 3;
}

// [y1  y0][x1  x0]
// [y1][x1][y0][x0]
export function interleave2x2(x: number, y?: number): number {
    let n = (null == y) ? (x & 0xF) : ((x & 0x3) | ((y & 0x3) << 2));
    n = (n & 0x9) | ((n & 0x2) << 1) | ((n & 0x4) >> 1);

    return n;
}

export function deinterleave2x2(n: number): number {
    n &= 0xF;
    n = (n & 0x9) | ((n & 0x2) << 1) | ((n & 0x4) >> 1);

    return n;
}

// [y3  y2  y1  y0][x3  x2  x1  x0]
// [y3  y2][x3  x2][y1  y0][x1  x0]
// [y3][x3][y2][x2][y1][x1][y0][x0]
export function interleave4x2(x: number, y?: number): number {
    let n = (null == y) ? (x & 0xFF) : ((x & 0xF) | ((y & 0xF) << 4));
    n = (n & 0xC3) | ((n & 0x0C) << 2) | ((n & 0x30) >> 2);
    n = (n & 0x99) | ((n & 0x22) << 1) | ((n & 0x44) >> 1);

    return n;
}

export function deinterleave4x2(n: number): number {
    n &= 0xFF;
    n = (n & 0x99) | ((n & 0x22) << 1) | ((n & 0x44) >> 1);
    n = (n & 0xC3) | ((n & 0x0C) << 2) | ((n & 0x30) >> 2);

    return n;
}

// [y7  y6  y5  y4  y3  y2  y1  y0  x7  x6  x5  x4  x3  x2  x1  x0]
// [y7  y6  y5  y4][x7  x6  x5  x4][y3  y2  y1  y0][x3  x2  x1  x0]
// [y7  y6][x7  x6][y5  y4][x5  x4][y3  y2][x3  x2][y1  y0][x1  x0]
// [y7][x7][y6][x6][y5][x5][y4][x4][y3][x3][y2][x2][y1][x1][y0][x0]
export function interleave8x2(x: number, y?: number): number {
    let n = (null == y) ? (x & 0xFFFF) : ((x & 0xFF) | ((y & 0xFF) << 8));
    n = (n & 0xF00F) | ((n & 0x00F0) << 4) | ((n & 0x0F00) >> 4);
    n = (n & 0xC3C3) | ((n & 0x0C0C) << 2) | ((n & 0x3030) >> 2);
    n = (n & 0x9999) | ((n & 0x2222) << 1) | ((n & 0x4444) >> 1);

    return n;
}

export function deinterleave8x2(n: number): number {
    n &= 0xFFFF;
    n = (n & 0x9999) | ((n & 0x2222) << 1) | ((n & 0x4444) >> 1);
    n = (n & 0xC3C3) | ((n & 0x0C0C) << 2) | ((n & 0x3030) >> 2);
    n = (n & 0xF00F) | ((n & 0x00F0) << 4) | ((n & 0x0F00) >> 4);

    return n;
}

// [yF  yE  yD  yC  yB  yA  y9  y8  y7  y6  y5  y4  y3  y2  y1  y0][xF  xE  xD  xC  xB  xA  x9  x8  x7  x6  x5  x4  x3  x2  x1  x0]
// [yF  yE  yD  yC  yB  yA  y9  y8][xF  xE  xD  xC  xB  xA  x9  x8][y7  y6  y5  y4  y3  y2  y1  y0][x7  x6  x5  x4  x3  x2  x1  x0]
// [yF  yE  yD  yC][xF  xE  xD  xC][yB  yA  y9  y8][xB  xA  x9  x8][y7  y6  y5  y4][x7  x6  x5  x4][y3  y2  y1  y0][x3  x2  x1  x0]
// [yF  yE][xF  xE][yD  yC][xD  xC][yB  yA][xB  xA][y9  y8][x9  x8][y7  y6][x7  x6][y5  y4][x5  x4][y3  y2][x3  x2][y1  y0][x1  x0]
// [yF][xF][yE][xE][yD][xD][yC][xC][yB][xB][yA][xA][y9][x9][y8][x8][y7][x7][y6][x6][y5][x5][y4][x4][y3][x3][y2][x2][y1][x1][y0][x0]
export function interleave16x2(x: number, y: number): number {
    let n = (null == y) ? (x & 0xFFFFFFFF) : ((x & 0xFFFF) | ((y & 0xFFFF) << 16));
    n = (n & 0xFF0000FF) | ((n & 0x0000FF00) << 8) | ((n & 0x00FF0000) >> 8);
    n = (n & 0xF00FF00F) | ((n & 0x00F000F0) << 4) | ((n & 0x0F000F00) >> 4);
    n = (n & 0xC3C3C3C3) | ((n & 0x0C0C0C0C) << 2) | ((n & 0x30303030) >> 2);
    n = (n & 0x99999999) | ((n & 0x22222222) << 1) | ((n & 0x44444444) >> 1);

    return n;
}

export function deinterleave16x2(n: number): number {
    n &= 0xFFFFFFFF;
    n = (n & 0x99999999) | ((n & 0x22222222) << 1) | ((n & 0x44444444) >> 1);
    n = (n & 0xC3C3C3C3) | ((n & 0x0C0C0C0C) << 2) | ((n & 0x30303030) >> 2);
    n = (n & 0xF00FF00F) | ((n & 0x00F000F0) << 4) | ((n & 0x0F000F00) >> 4);
    n = (n & 0xFF0000FF) | ((n & 0x0000FF00) << 8) | ((n & 0x00FF0000) >> 8);

    return n;
}