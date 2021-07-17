import { BufferGeometry, LinearFilter, Mesh, MeshBasicMaterial, RepeatWrapping, Scene } from "three";
import { createBufferAttribute } from '../../../../util/buffer-attr';
import { fetchTexture } from "../../../../util/texture";
import { registerTickFunction } from "../../renderer/tick";

const scene = new Scene();

const geom1 = new BufferGeometry();
geom1.setAttribute('position', createBufferAttribute(new Float32Array([
    0, 0, -0.3,
    1, 0, -0.3,
    0, 1, -0.3,
    1, 1, -0.3,
]), 3));
geom1.setAttribute('color', createBufferAttribute(new Float32Array([
    0.94, 0.75, 0.35,
    0.27, 0.71, 0.67,
    0.94, 0.75, 0.35,
    0.27, 0.71, 0.67,
]), 3));
geom1.setIndex([ 0, 1, 2, 1, 3, 2 ]);

const mat1 = new MeshBasicMaterial({ vertexColors: true });

const mesh1 = new Mesh(geom1, mat1);
mesh1.layers.mask = 1;

const geom2 = new BufferGeometry();
geom2.setAttribute('position', createBufferAttribute(new Float32Array([
    0, 0, -0.2,
    1, 0, -0.2,
    0, 0.2, -0.2,
    1, 0.2, -0.2,
    0, 0.5, -0.2,
    1, 0.5, -0.2,
    0, 1, -0.2,
    1, 1, -0.2,
]), 3));
geom2.setAttribute('color', createBufferAttribute(new Float32Array([
    0, 0, 0, 0.4,
    0, 0, 0, 0.4,
    0, 0, 0, 0.6,
    0, 0, 0, 0.6,
    0, 0, 0, 0.8,
    0, 0, 0, 0.8,
    0, 0, 0, 1,
    0, 0, 0, 1,
]), 4));
geom2.setIndex([ 0, 1, 2, 1, 3, 2, 2, 3, 4, 3, 5, 4, 4, 5, 6, 5, 7, 6 ]);

const mat2 = new MeshBasicMaterial({ vertexColors: true, transparent: true });
(mat2 as any).vertexAlphas = true;

const mesh2 = new Mesh(geom2, mat2);
mesh2.layers.mask = 1;

const geom3 = new BufferGeometry();
geom3.setAttribute('position', createBufferAttribute(new Float32Array([
    0, 0, -0.1,
    1, 0, -0.1,
    0, 1, -0.1,
    1, 1, -0.1,
]), 3));
geom3.setAttribute('uv', createBufferAttribute(new Float32Array([
    0, 0,
    1, 0,
    0, 1,
    1, 1,
]), 2));
geom3.setIndex([ 0, 1, 2, 1, 3, 2 ]);

const mat3 = new MeshBasicMaterial({ transparent: true });

const mesh3 = new Mesh(geom3, mat3);
mesh3.layers.mask = 1;
mesh3.visible = false;

const geomEL = new BufferGeometry();
geomEL.setAttribute('position', createBufferAttribute(new Float32Array([
    0, 0, -0.1,
    1, 0, -0.1,
    0, 1, -0.1,
    1, 1, -0.1,
]), 3));
const uvEL = createBufferAttribute(new Float32Array([
    0, 0,
    1, 0,
    0, 1,
    1, 1,
]), 2);
geomEL.setAttribute('uv', uvEL);
geomEL.setIndex([ 0, 1, 2, 1, 3, 2 ]);

const geomES = new BufferGeometry();
geomES.setAttribute('position', createBufferAttribute(new Float32Array([
    0, 0, -0.1,
    1, 0, -0.1,
    0, 1, -0.1,
    1, 1, -0.1,
]), 3));
const uvES = createBufferAttribute(new Float32Array([
    0, 0,
    2, 0,
    0, 2,
    2, 2,
]), 2);
geomES.setAttribute('uv', uvES);
geomES.setIndex([ 0, 1, 2, 1, 3, 2 ]);

const matEL = new MeshBasicMaterial({ transparent: true });

const matES = new MeshBasicMaterial({ transparent: true });

const meshEL = new Mesh(geomEL, matEL);
meshEL.layers.mask = 2;
meshEL.visible = false;

const meshES = new Mesh(geomES, matES);
meshES.layers.mask = 2;
meshES.visible = false;

let sfWidth: number | null = null;
let sfHeight: number | null = null;

export const mapLoaded = fetchTexture('./images/ltalpha.png').then(tex => {
    tex.minFilter = LinearFilter;
    tex.magFilter = LinearFilter;

    mat3.alphaMap = tex;
    mat3.needsUpdate = true;
    mesh3.visible = true;
});

fetchTexture('./images/staralpha.png').then(tex => {
    sfWidth = tex.image.width;
    sfHeight = tex.image.height;

    tex.minFilter = LinearFilter;
    tex.magFilter = LinearFilter;
    tex.wrapS = RepeatWrapping;
    tex.wrapT = RepeatWrapping;

    matEL.alphaMap = tex;
    matEL.needsUpdate = true;
    meshEL.visible = true;
});

fetchTexture('./images/staralpha2.png').then(tex => {
    tex.minFilter = LinearFilter;
    tex.magFilter = LinearFilter;
    tex.wrapS = RepeatWrapping;
    tex.wrapT = RepeatWrapping;

    matES.alphaMap = tex;
    matES.needsUpdate = true;
    meshES.visible = true;
});

scene.add(mesh1, mesh2, mesh3, meshEL, meshES);

registerTickFunction('updateNightSky', time => {
    if (null == sfWidth || null == sfHeight) {
        return;
    }

    const t = (time / 30000) % 1;

    const uWidth = innerWidth * devicePixelRatio / sfWidth;
    const vHeight = innerHeight * devicePixelRatio / sfHeight;

    const uvLarge = uvEL.array;
    uvLarge[0] = t * 2;
    uvLarge[1] = -t;
    uvLarge[2] = uWidth + t * 2;
    uvLarge[3] = -t;
    uvLarge[4] = t * 2;
    uvLarge[5] = vHeight - t;
    uvLarge[6] = uWidth + t * 2;
    uvLarge[7] = vHeight - t;
    uvEL.needsUpdate = true;

    const uvSmall = uvES.array;
    uvSmall[0] = t * 2;
    uvSmall[1] = -t;
    uvSmall[2] = uWidth * 2 + t * 2;
    uvSmall[3] = -t;
    uvSmall[4] = t * 2;
    uvSmall[5] = vHeight * 2 - t;
    uvSmall[6] = uWidth * 2 + t * 2;
    uvSmall[7] = vHeight * 2 - t;
    uvES.needsUpdate = true;
}, {
    before: ['render'],
});

export default scene;
