import { BufferGeometry, Mesh, MeshBasicMaterial } from 'three';
import scene from '.';
import { registerTickFunction } from '../../renderer/tick';
import { mix, unmix } from '../../../../util/math/mix';
import { smootherstep } from '../../../../util/math/step';
import { lab2rgb } from '../../../../util/rgb-lab';
import settings, { settingsAddOnChange } from '../../sync/settings';
import { saturate } from '../../../../util/math/saturate';
import { getElementsByClassName } from '../../../../util/style-observer';
import { getElementMatrix } from '../../../../util/element-matrix';
import { TypedBufferAttribute, createBufferAttribute } from '../../../../util/buffer-attr';
import RangeMap from '../../../../util/range-map';

const WIDTH = 24;
const HEIGHT = 9;
const PERIOD = 1000;

const IW = 1 / WIDTH;
const IH = 1 / HEIGHT;
const IW_2 = IW / 2;
const IH_2 = IH / 2;

interface GeometryBuildResult {
    geometry: BufferGeometry;
    positions: TypedBufferAttribute<Float32Array>;
    colors: TypedBufferAttribute<Float32Array>;
    indices: Int32Array;
}

class GeometryBuilder {
    nTris: number;
    i: number;
    moving: Float32Array;
    indices: Int32Array;
    positions: Float32Array;
    colors: Float32Array;
    constructor(nTris: number, moving: Float32Array) {
        this.nTris = nTris;
        this.i = 0;
        this.moving = moving;
        this.indices = new Int32Array(nTris * 3);
        this.positions = new Float32Array(nTris * 9);
        this.colors = new Float32Array(nTris * 12);
    }
    vtx(x: number, y: number, index: number = -1): this {
        const pi = this.i * 3;
        const ci = this.i * 4;
        this.positions[pi    ] = x;
        this.positions[pi + 1] = y;
        this.positions[pi + 2] = 0;
        this.colors[ci    ] = x;
        this.colors[ci + 1] = y;
        this.colors[ci + 2] = (1 - x) * (1 - y);
        this.colors[ci + 3] = 1;
        this.indices[this.i] = index;
        ++this.i;

        return this;
    }
    mov(index: number, x?: number, y?: number): this {
        if (index < 0 || index * 2 >= this.moving.length) {
            if (null == x || null == y) {
                throw new RangeError("index out of bounds and default coordinates missing");
            }

            return this.vtx(x, y);
        }

        return this.vtx(this.moving[index * 2], this.moving[index * 2 + 1], index);
    }
    build(): GeometryBuildResult {
        const positions = createBufferAttribute(this.positions, 3);
        const colors = createBufferAttribute(this.colors, 4);

        const geometry = new BufferGeometry();
        geometry.setAttribute('position', positions);
        geometry.setAttribute('color', colors);

        return {
            geometry,
            positions,
            colors,
            indices: this.indices,
        }
    }
}

function rangeMapInterpolate(key: number, lowerKey: number, upperKey: number, lowerValue: number, upperValue: number): number {
    return mix(lowerValue, upperValue, unmix(lowerKey, upperKey, key));
}
const xAnchors = new RangeMap(rangeMapInterpolate);
const yAnchors = new RangeMap(rangeMapInterpolate);

function updateXAnchors(): void {
    xAnchors.clear();
    xAnchors.set(0, 0);
    xAnchors.set(WIDTH * 2, 1);
    if (settings.snapLeft) {
        const keyF = settings.left * (WIDTH * 2);
        let key = Math.round(keyF);
        if (0 === key) {
            key = Math.ceil(keyF);
        }
        xAnchors.set(key, settings.left);
        xAnchors.set(key + 1, settings.left);
    }
    if (settings.snapRight) {
        const keyF = settings.right * (WIDTH * 2);
        let key = Math.round(keyF);
        if (WIDTH * 2 === key) {
            key = Math.floor(keyF);
        }
        xAnchors.set(key, settings.right);
        xAnchors.set(key - 1, settings.right);
    }
}

function updateYAnchors(): void {
    yAnchors.clear();
    yAnchors.set(0, 0);
    yAnchors.set(HEIGHT * 2, 1);
    if (settings.snapBottom) {
        const keyF = settings.bottom * (HEIGHT * 2);
        let key = Math.round(keyF);
        if (0 === key) {
            key = Math.ceil(keyF);
        }
        yAnchors.set(key, settings.bottom);
    }
    if (settings.snapTop) {
        const keyF = settings.top * (HEIGHT * 2);
        let key = Math.round(keyF);
        if (HEIGHT * 2 === key) {
            key = Math.floor(keyF);
        }
        yAnchors.set(key, settings.top);
    }
}

settingsAddOnChange('left', updateXAnchors);
settingsAddOnChange('right', updateXAnchors);
settingsAddOnChange('snapLeft', updateXAnchors);
settingsAddOnChange('snapRight', updateXAnchors);

settingsAddOnChange('bottom', updateYAnchors);
settingsAddOnChange('top', updateYAnchors);
settingsAddOnChange('snapBottom', updateYAnchors);
settingsAddOnChange('snapTop', updateYAnchors);

updateXAnchors();
updateYAnchors();

const movingBase = new Float32Array(((WIDTH * 2 - 1) * (HEIGHT - 1) + WIDTH) * 2);

generateDisturbedField(movingBase, 0);

let t = performance.now();
let movingFrom = new Float32Array(movingBase);
let movingTo = new Float32Array(movingBase);
const moving = new Float32Array(movingBase);

const builder = new GeometryBuilder(HEIGHT * (2 + WIDTH * 4), moving);

for (let i = 0; i < HEIGHT; ++i) {
    const y = i * IH;
    const mi = i * (WIDTH * 2 - 1);
    builder.vtx(0, y).mov(mi).vtx(0, y + IH_2)
           .vtx(0, y + IH_2).mov(mi).vtx(0, y + IH);
    for (let j = 0; j < WIDTH - 1; ++j) {
        const x = j * IW;
        builder.mov((0 === j) ? -1 : (mi - WIDTH + j), x, y).mov(mi - WIDTH + j + 1, x + IW, y).mov(mi + j)
               .mov(mi + j).mov(mi - WIDTH + j + 1, x + IW, y).mov(mi + j + 1)
               .mov((0 === j) ? -1 : (mi + WIDTH + j - 1), x, y + IH).mov(mi + j).mov(mi + WIDTH + j, x + IW, y + IH)
               .mov(mi + j + 1).mov(mi + WIDTH + j, x + IW, y + IH).mov(mi + j);
    }
    builder.mov(mi - 1, 1 - IW, y).vtx(1, y).mov(mi + WIDTH - 1)
           .mov(mi + WIDTH - 1).vtx(1, y).vtx(1, y + IH_2)
           .mov(mi + WIDTH * 2 - 2, 1 - IW, y + IH).mov(mi + WIDTH - 1).vtx(1, y + IH)
           .vtx(1, y + IH_2).vtx(1, y + IH).mov(mi + WIDTH - 1);
}

const { geometry, positions, colors, indices } = builder.build();
const positionsBase = new Float32Array(positions.array);

function generateDisturbedField(field: Float32Array, amplitude: number = 1 / 3): void {
    for (let i = 0; i < field.length; i += 2) {
        const iXR = (i / 2) % (WIDTH * 2 - 1);
        const iYR = 0 | ((i / 2) / (WIDTH * 2 - 1));
        const iX = iXR * 2 % (WIDTH * 2 - 1) + 1;
        const iY = iYR * 2 + ((iXR < WIDTH) ? 1 : 2);
        const xQuery = xAnchors.query(iX);
        const yQuery = yAnchors.query(iY);
        if (null == xQuery || null == yQuery) {
            throw new Error("Out of bounds anchor query " + iX + ", " + iY + " (" + (i / 2) + ")");
        }
        if (xQuery.exact || yQuery.exact) {
            field[i    ] = xQuery.value;
            field[i + 1] = yQuery.value;
        } else {
            let xOff: number;
            let yOff: number;
            do {
                xOff = Math.random() * 2 - 1;
                yOff = Math.random() * 2 - 1;
            } while (xOff * xOff + yOff * yOff > 1);
            field[i    ] = xQuery.value + xOff * amplitude * (xQuery.upperValue - xQuery.lowerValue) / (xQuery.upperKey - xQuery.lowerKey);
            field[i + 1] = yQuery.value + yOff * amplitude * (yQuery.upperValue - yQuery.lowerValue) / (yQuery.upperKey - yQuery.lowerKey);
        }
    }
}

function mixField(field: Float32Array, from: Float32Array, to: Float32Array, a: number): void {
    for (let i = 0; i < field.length; ++i) {
        field[i] = mix(from[i], to[i], a);
    }
}

const material = new MeshBasicMaterial({ vertexColors: true, transparent: true });
(material as any).vertexAlphas = true;

const mesh = new Mesh(geometry, material);
mesh.position.z = -0.1;

scene.add(mesh);

generateDisturbedField(movingFrom);
generateDisturbedField(movingTo);

registerTickFunction('updateTrianglePositions', (time: number) => {
    if ((0 | (t / PERIOD)) !== (0 | (time / PERIOD))) {
        const tmp = movingFrom;
        movingFrom = movingTo;
        movingTo = tmp;
        generateDisturbedField(movingTo);
    }
    t = time;
    mixField(moving, movingFrom, movingTo, smootherstep((time % PERIOD) / PERIOD));
    const pos = positions.array;
    for (let i = 0; i < indices.length; ++i) {
        if (indices[i] >= 0) {
            pos[i * 3    ] = moving[indices[i] * 2    ];
            pos[i * 3 + 1] = moving[indices[i] * 2 + 1];
        } else {
            const iX = 0 | Math.round(positionsBase[i * 3    ] * WIDTH * 2);
            const iY = 0 | Math.round(positionsBase[i * 3 + 1] * HEIGHT * 2);
            const xQuery = xAnchors.query(iX);
            const yQuery = yAnchors.query(iY);
            if (null == xQuery || null == yQuery) {
                throw new Error("Out of bounds anchor query " + iX + ", " + iY);
            }
            pos[i * 3    ] = xQuery.value;
            pos[i * 3 + 1] = yQuery.value;
        }
    }
    positions.needsUpdate = true;
}, {
    before: ['render'],
});

interface TransmittanceBox {
    opacity: number;
    ltX: number;
    ltY: number;
    rtX: number;
    rtY: number;
    rbX: number;
    rbY: number;
    lbX: number;
    lbY: number;
}

class TransmittanceField {
    private readonly elements: Set<Element>;
    private readonly elementBoxes: TransmittanceBox[];
    constructor() {
        this.elements = getElementsByClassName('with-triangles');
        this.elementBoxes = [];
        this.refresh();
    }
    refresh(): void {
        this.elementBoxes.length = 0;
        for (const element of this.elements) {
            const computedStyle = getComputedStyle(element);
            const width = (element instanceof HTMLElement) ? element.offsetWidth : element.clientWidth;
            const height = (element instanceof HTMLElement) ? element.offsetHeight : element.clientHeight;
            const opacity = parseFloat(computedStyle.opacity);
            if (0 === opacity || 0 === width || 0 === height) {
                continue;
            }
            const matrix = getElementMatrix(element);
            const cornersAll = [
                matrix.transformPoint({ x: 0, y: 0 }),
                matrix.transformPoint({ x: width, y: 0 }),
                matrix.transformPoint({ x: width, y: height }),
                matrix.transformPoint({ x: 0, y: height }),
            ];
            cornersAll.sort((a, b) => {
                const cmp = (a.x + a.y) - (b.x + b.y);
                if (0 !== cmp) {
                    return cmp;
                }

                return (a.y - a.x) - (b.y - b.x);
            });
            const xRbLt = cornersAll[3].x - cornersAll[0].x;
            const yRbLt = cornersAll[3].y - cornersAll[0].y;
            const cornersRtLb = cornersAll.slice(1, 3);
            cornersRtLb.sort((a, b) => (a.x * -yRbLt + a.y * xRbLt) - (b.x * -yRbLt + b.y * xRbLt));

            this.elementBoxes.push({
                opacity,
                ltX: cornersAll[0].x / innerWidth,
                ltY: 1 - (cornersAll[0].y / innerHeight),
                rtX: cornersRtLb[0].x / innerWidth,
                rtY: 1 - (cornersRtLb[0].y / innerHeight),
                rbX: cornersAll[3].x / innerWidth,
                rbY: 1 - (cornersAll[3].y / innerHeight),
                lbX: cornersRtLb[1].x / innerWidth,
                lbY: 1 - (cornersRtLb[1].y / innerHeight),
            });
        }
    }
    private elementAt({ opacity, ltX, ltY, rtX, rtY, rbX, rbY, lbX, lbY }: TransmittanceBox, x: number, y: number): number {
        if (0 === opacity) {
            return 1;
        }

        const tY = mix(ltY, rtY, unmix(ltX, rtX, x));
        const bY = mix(lbY, rbY, unmix(lbX, rbX, x));
        const lX = mix(ltX, lbX, unmix(ltY, lbY, y));
        const rX = mix(rtX, rbX, unmix(rtY, rbY, y));

        const xyOpacity = opacity
            * saturate(unmix(bY - 0.025, bY + 0.025, y))
            * saturate(unmix(tY + 0.025, tY - 0.025, y))
            * saturate(unmix(lX - 0.025, lX + 0.025, x))
            * saturate(unmix(rX + 0.025, rX - 0.025, x));

        return 1 - xyOpacity;
    }
    private elementsAt(x: number, y: number): number {
        let transmittance = 1;
        for (const helper of this.elementBoxes) {
            transmittance *= this.elementAt(helper, x, y);
        }

        return transmittance;
    }
    private lrAtX(x: number): number {
        return (settings.snapLeft ? ((x > settings.left) ? 1 : 0) : saturate(unmix(settings.left - 0.05, settings.left, x)))
             * (settings.snapRight ? ((x < settings.right) ? 1 : 0) : saturate(unmix(settings.right + 0.05, settings.right, x)));
    }
    private tbAtY(y: number): number {
        return (settings.snapBottom ? ((y > settings.bottom) ? 1 : 0) : saturate(unmix(settings.bottom - 0.05, settings.bottom, y)))
             * (settings.snapTop ? ((y < settings.top) ? 1 : 0) : saturate(unmix(settings.top + 0.05, settings.top, y)));
    }
    at(x: number, y: number): number {
        return this.lrAtX(x)
             * this.tbAtY(y)
             * this.elementsAt(x, y);
    }
}

const transmittance = new TransmittanceField();

registerTickFunction('updateTriangleColors', () => {
    const pos = positions.array;
    const clr = colors.array;
    transmittance.refresh();
    for (let i = 0; i < pos.length; i += 9) {
        const j = (i * 4 / 3);
        const xA = pos[i], xB = pos[i + 3], xC = pos[i + 6];
        const yA = pos[i + 1], yB = pos[i + 4], yC = pos[i + 7];
        // const xAB = positionsBase[i], xBB = positionsBase[i + 3], xCB = positionsBase[i + 6];
        const yAB = positionsBase[i + 1], yBB = positionsBase[i + 4],  yCB = positionsBase[i + 7];
        const xMin = Math.min(xA, xB, xC);
        const yMin = Math.min(yA, yB, yC);
        const xMax = Math.max(xA, xB, xC);
        const yMax = Math.max(yA, yB, yC);
        const xMid = (xMin + xMax) / 2;
        const yMid = (yMin + yMax) / 2;
        const yD = yMax - yMin;
        const yDB = Math.max(yAB, yBB, yCB) - Math.min(yAB, yBB, yCB);
        const L = saturate(yDB / yD / 2);
        const [r, g, b] = lab2rgb([L * 100, settings.chromaA, settings.chromaB]);
        clr[j    ] = clr[j + 4] = clr[j + 8 ] = r;
        clr[j + 1] = clr[j + 5] = clr[j + 9 ] = g;
        clr[j + 2] = clr[j + 6] = clr[j + 10] = b;
        clr[j + 3] = clr[j + 7] = clr[j + 11] = 1 - transmittance.at(xMid, yMid);
    }
    colors.needsUpdate = true;
}, {
    before: ['render'],
    after: ['updateTrianglePositions'],
});