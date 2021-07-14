import { lab2rgb } from '../../util/rgb-lab';

const WIDTH = 303;
const HEIGHT = 303;

const data = new Uint32Array(WIDTH * HEIGHT);
for (let b = -50, j = 0; b <= 50; ++b, ++j) {
    for (let a = -50, i = 0; a <= 50; ++a, ++i) {
        const [red, green, blue] = lab2rgb([50, a, b]);
        const abgr = 0xFF000000 | (Math.round(blue * 255) << 16) | (Math.round(green * 255) << 8) | Math.round(red * 255);
        const base = j * WIDTH * 3 + i * 3;

        let off = base;
        data[off++] = abgr;
        data[off++] = abgr;
        data[off++] = abgr;

        off = base + WIDTH;
        data[off++] = abgr;
        data[off++] = abgr;
        data[off++] = abgr;

        off = base + WIDTH * 2;
        data[off++] = abgr;
        data[off++] = abgr;
        data[off++] = abgr;
    }
}

export default new ImageData(new Uint8ClampedArray(data.buffer), 303, 303);