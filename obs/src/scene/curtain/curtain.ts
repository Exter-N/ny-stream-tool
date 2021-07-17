import { BufferGeometry, DoubleSide, Mesh, MeshStandardMaterial, Vector2, Vector3 } from "three";
import scene from ".";
import { createBufferAttribute } from "../../../../util/buffer-attr";
import MulticastCallback from "../../../../util/multicast-callback";
import { addComputedLine } from "../../../../util/simple-objects";
import { registerTickFunction } from "../../renderer/tick";

const BASE_WIDTH = 6400 / 9;
const BASE_HEIGHT = 400;

export const HORIZ_SPRINGS = 64;
const VERT_SPRINGS = 36;

const DAMPING = 0.03;
const DRAG = 1 - DAMPING;

const MASS = 0.1;
const INV_MASS = 1 / MASS;

const GRAVITY = 9.81 * 20 * MASS;
let windMaxStrength = 3;
let windAngleOffset = 0;

const FLOOR_Y = -200;

const geometry = new BufferGeometry();

const positions = createBufferAttribute(new Float32Array(3 * (HORIZ_SPRINGS + 1) * (VERT_SPRINGS + 1)), 3, (array, index) => {
    const i = index / 3;
    const iX = i % (HORIZ_SPRINGS + 1);
    const iY = 0 | (i / (HORIZ_SPRINGS + 1));

    array[index    ] = iX * BASE_WIDTH / HORIZ_SPRINGS - BASE_WIDTH / 2;
    array[index + 1] = iY * BASE_HEIGHT / VERT_SPRINGS - BASE_HEIGHT / 2;
    array[index + 2] = (0 === (iX % (HORIZ_SPRINGS / 8))) ? 0 : Math.sin(iX * Math.PI * 8 / HORIZ_SPRINGS) * 10;
});

const originalPositions = new Float32Array(positions.array);
let previousPositions = new Float32Array(originalPositions);
let currentPositions = new Float32Array(originalPositions);

const originalRailPositions = new Float32Array(2 * (HORIZ_SPRINGS + 1));
for (let i = 0, j = 3 * (HORIZ_SPRINGS + 1) * VERT_SPRINGS; i < originalRailPositions.length; i += 2, j += 3) {
    originalRailPositions[i    ] = originalPositions[j    ];
    originalRailPositions[i + 1] = originalPositions[j + 2];
}
export const currentRailPositions = new Float32Array(originalRailPositions);

const forces = new Float32Array(positions.array.length);

const normals = createBufferAttribute(new Float32Array(3 * (HORIZ_SPRINGS + 1) * (VERT_SPRINGS + 1)), 3);
geometry.setAttribute('position', positions);
geometry.setAttribute('normal', normals);
geometry.setAttribute('uv', createBufferAttribute(new Float32Array(2 * (HORIZ_SPRINGS + 1) * (VERT_SPRINGS + 1)), 2, (array, index) => {
    const i = index / 2;
    const iX = i % (HORIZ_SPRINGS + 1);
    const iY = 0 | (i / (HORIZ_SPRINGS + 1));

    array[index    ] = iX / HORIZ_SPRINGS;
    array[index + 1] = iY / VERT_SPRINGS;
}));

const indexFunctions: ((x: number, y: number) => number)[] = [
    (x, y) => y * (HORIZ_SPRINGS + 1) + x,
    (x, y) => y * (HORIZ_SPRINGS + 1) + x + 1,
    (x, y) => (y + 1) * (HORIZ_SPRINGS + 1) + x,
    (x, y) => y * (HORIZ_SPRINGS + 1) + x + 1,
    (x, y) => (y + 1) * (HORIZ_SPRINGS + 1) + x + 1,
    (x, y) => (y + 1) * (HORIZ_SPRINGS + 1) + x,
];
geometry.setIndex(createBufferAttribute(new Uint16Array(6 * HORIZ_SPRINGS * VERT_SPRINGS), 1, (array, index) => {
    const iVtx = index % 6;
    const iQuad = 0 | (index / 6);
    const iX = iQuad % HORIZ_SPRINGS;
    const iY = 0 | (iQuad / HORIZ_SPRINGS);

    array[index] = indexFunctions[iVtx](iX, iY);
}));

export const material = new MeshStandardMaterial({ side: DoubleSide, emissive: 0xFFFFFF });

const mesh = new Mesh(geometry, material);
mesh.position.set(0, 0, 0);
mesh.castShadow = true;
mesh.receiveShadow = true;

scene.add(mesh);

const railSprings: number[] = [];
const springs: number[] = [];
const pins: number[] = [];

for (let index = 0; index < originalPositions.length; index += 3) {
    const i = index / 3;
    const iX = i % (HORIZ_SPRINGS + 1);
    const iY = 0 | (i / (HORIZ_SPRINGS + 1));

    if (HORIZ_SPRINGS !== iX) {
        springs.push(index, index + 3, Math.hypot(
            originalPositions[index + 3] - originalPositions[index    ],
            originalPositions[index + 4] - originalPositions[index + 1],
            originalPositions[index + 5] - originalPositions[index + 2]));
        if (VERT_SPRINGS === iY) {
            railSprings.push(Math.hypot(
                originalPositions[index + 3] - originalPositions[index    ],
                originalPositions[index + 5] - originalPositions[index + 2]));
        }
    }

    if (VERT_SPRINGS !== iY) {
        springs.push(index, index + (HORIZ_SPRINGS + 1) * 3, Math.hypot(
            originalPositions[index + (HORIZ_SPRINGS + 1) * 3    ] - originalPositions[index    ],
            originalPositions[index + (HORIZ_SPRINGS + 1) * 3 + 1] - originalPositions[index + 1],
            originalPositions[index + (HORIZ_SPRINGS + 1) * 3 + 2] - originalPositions[index + 2]));
    } else {
        // if (0 === (iX % (HORIZ_SPRINGS / 8))) {
            pins.push(index    , originalPositions[index    ]);
            pins.push(index + 1, originalPositions[index + 1]);
            pins.push(index + 2, originalPositions[index + 2]);
        // }
    }
}

export function moveRailVertex(index: number, desiredX: number): void {
    currentRailPositions[index * 2] = desiredX;
    for (let i = (index * 2) - 2; i >= 0; i -= 2) {
        const displacement = Math.max(0, currentRailPositions[i] - currentRailPositions[i + 2] + 1);
        if (displacement > 0) {
            currentRailPositions[i] -= displacement;
        }
    }
    for (let i = (index * 2) + 2; i < currentRailPositions.length; i += 2) {
        const displacement = Math.max(0, currentRailPositions[i - 2] + 1 - currentRailPositions[i]);
        if (displacement > 0) {
            currentRailPositions[i] += displacement;
        }
    }
    while (satisfyRailConstraints(index) >= 1);
    updatePinConstraintsFromRail();
}

function satisfyRailConstraints(movedIndex: number): number {
    let maxCorrection = 0;
    const xAtIndex = currentRailPositions[movedIndex * 2];
    const zAtIndex = currentRailPositions[movedIndex * 2 + 1];
    const diff = new Vector2();
    const correction = new Vector2();
    for (let ii = 0; ii < railSprings.length; ++ii) {
        const index = ii * 2;
        const distance = railSprings[ii];

        diff.set(
            currentRailPositions[index + 2] - currentRailPositions[index    ],
            currentRailPositions[index + 3] - currentRailPositions[index + 1]);

        const currentDist = diff.length();
        if (0 === currentDist) {
            continue;
        }
        correction.copy(diff);
        correction.multiplyScalar((1 - distance / currentDist) * 0.5);
        correction.x = Math.max(-distance, Math.min(distance, correction.x));
        correction.y = Math.max(-distance, Math.min(distance, correction.y));
        maxCorrection = Math.max(maxCorrection, correction.length());
        currentRailPositions[index    ] += correction.x;
        currentRailPositions[index + 1] += correction.y;
        currentRailPositions[index + 2] -= correction.x;
        currentRailPositions[index + 3] -= correction.y;
    }

    currentRailPositions[movedIndex * 2] = xAtIndex;
    currentRailPositions[movedIndex * 2 + 1] = zAtIndex;

    for (let ii = 0; ii < currentRailPositions.length; ii += 2) {
        if (ii === movedIndex * 2) {
            continue;
        }
        if (ii < movedIndex * 2) {
            currentRailPositions[ii] = Math.min(currentRailPositions[ii], currentRailPositions[ii + 2] - 1);
        } else {
            currentRailPositions[ii] = Math.max(currentRailPositions[ii], currentRailPositions[ii - 2] + 1);
        }
        const origZ = originalRailPositions[ii + 1];
        if (0 === origZ) {
            currentRailPositions[ii + 1] = 0;
        } else if (origZ < 0) {
            if (currentRailPositions[ii + 1] >= 0) {
                currentRailPositions[ii + 1] = Math.min(currentRailPositions[ii - 1] ?? 0, currentRailPositions[ii + 3] ?? 0);
            }
        } else {
            if (currentRailPositions[ii + 1] <= 0) {
                currentRailPositions[ii + 1] = Math.max(currentRailPositions[ii - 1] ?? 0, currentRailPositions[ii + 3] ?? 0);
            }
        }
    }

    return maxCorrection;
}

function updatePinConstraintsFromRail(): void {
    for (let i = 0; i < pins.length; i += 2) {
        const ii = pins[i];
        if (1 === (ii % 3)) {
            continue;
        }
        const index = 0 | (ii / 3);
        const iY = 0 | (index / (HORIZ_SPRINGS + 1));
        if (VERT_SPRINGS !== iY) {
            continue;
        }
        const iX = index % (HORIZ_SPRINGS + 1);
        pins[i + 1] = currentRailPositions[iX * 2 + ((2 === (ii % 3)) ? 1 : 0)];
    }
}

const positionDebugUpdateGroup = new MulticastCallback<[]>();

for (let i = 0; i < positions.array.length; i += 3) {
    const ii = i / 3;
    const iX = ii % (HORIZ_SPRINGS + 1);
    const iY = 0 | (ii / (HORIZ_SPRINGS + 1));

    if (0 === ((iX | iY) & 3)) {
        /*addComputedLine(scene, positionDebugUpdateGroup, (a, b) => {
            a.fromArray(positions.array, i);
            b.fromArray(forces, i).multiplyScalar(1).add(a);
        }, 0x00FFFF);*/
    }
}

export function setWindMaxStrength(value: number): void {
    windMaxStrength = value;
}

export function setWindAngleOffset(value: number): void {
    windAngleOffset = value * Math.PI / 180;
}

const windForce = new Vector3();

/*addComputedLine(scene, positionDebugUpdateGroup, (a, b) => {
    a.set(0, 0, 0);
    b.copy(windForce).multiplyScalar(-30);
}, 0xFF00FF);*/

function updateWindForce(time: number): void {
    const windAngle = windAngleOffset + (Math.cos(time * Math.PI / 4000) * 0.5);
    const windStrength = windMaxStrength * (Math.cos(time * Math.PI / 7000) + 2) / 3;
    windForce.set(windStrength * Math.sin(windAngle), 0, windStrength * Math.cos(windAngle));
}

function updateForces(): void {
    const force = new Vector3();
    const normal = new Vector3();
    for (let index = 0; index < forces.length; index += 3) {
        force.set(0, -GRAVITY, 0);

        normal.fromArray(normals.array, index);
        force.addScaledVector(normal, normal.dot(windForce));

        force.toArray(forces, index);
    }
}

function integrate(): void {
    const deltaTimeSq = (18 / 1000) ** 2;
    // const deltaTimeSq = deltaTime ** 2;

    const secondPreviousPositions = previousPositions;
    previousPositions = currentPositions;
    currentPositions = secondPreviousPositions;

    // Perform Verlet integration
    for (let index = 0; index < currentPositions.length; ++index) {
        const newPos = (previousPositions[index] - secondPreviousPositions[index]) * DRAG + previousPositions[index] + (forces[index] * INV_MASS) * deltaTimeSq;
        currentPositions[index] = newPos;
    }
}

function satisfyFloorConstraint(): void {
    for (let index = 0; index < currentPositions.length; index += 3) {
        if (currentPositions[index + 1] < FLOOR_Y) {
            const displacement = Math.min(FLOOR_Y - currentPositions[index + 1], Math.abs(previousPositions[index + 1] - currentPositions[index + 1]));
            currentPositions[index    ] += (Math.random() - 0.5) * displacement * 2;
            currentPositions[index + 1] = FLOOR_Y;
            currentPositions[index + 2] += (Math.random() - 0.5) * displacement * 2;
        }
    }
}

function satisfySpringConstraints(): void {
    const diff = new Vector3();
    const correction = new Vector3();
    for (let ii = 0; ii < springs.length; ii += 3) {
        const index1 = springs[ii];
        const index2 = springs[ii + 1];
        const distance = springs[ii + 2];

        diff.set(
            currentPositions[index2    ] - currentPositions[index1    ],
            currentPositions[index2 + 1] - currentPositions[index1 + 1],
            currentPositions[index2 + 2] - currentPositions[index1 + 2]);

        const currentDist = diff.length();
        if (0 === currentDist) {
            continue;
        }
        correction.copy(diff);
        correction.multiplyScalar((1 - distance / currentDist) * 0.5);
        correction.x = Math.max(-distance, Math.min(distance, correction.x));
        correction.y = Math.max(-distance, Math.min(distance, correction.y));
        correction.z = Math.max(-distance, Math.min(distance, correction.z));
        currentPositions[index1    ] += correction.x;
        currentPositions[index1 + 1] += correction.y;
        currentPositions[index1 + 2] += correction.z;
        currentPositions[index2    ] -= correction.x;
        currentPositions[index2 + 1] -= correction.y;
        currentPositions[index2 + 2] -= correction.z;
    }
}

function satisfyPinConstraints(): void {
    for (let ii = 0; ii < pins.length; ii += 2) {
        currentPositions[pins[ii]] = pins[ii + 1];
    }
}

registerTickFunction('updateCurtainPositions', time => {
    updateWindForce(time);
    updateForces();
    integrate();
    satisfyFloorConstraint();
    satisfySpringConstraints();
    satisfyPinConstraints();

    const array = positions.array;

    for (let index = 0; index < array.length; ++index) {
        array[index] = currentPositions[index];
    }
    positions.needsUpdate = true;

    positionDebugUpdateGroup.call();
}, {
    before: ['render'],
});

const normalDebugUpdateGroup = new MulticastCallback<[]>();

/*for (let i = 0; i < normals.array.length; i += 3) {
    const ii = i / 3;
    const iX = ii % (HORIZ_SPRINGS + 1);
    const iY = 0 | (ii / (HORIZ_SPRINGS + 1));

    if (0 === ((iX | iY) & 3)) {
        addComputedLine(scene, normalDebugUpdateGroup, (a, b) => {
            a.fromArray(positions.array, i);
            b.fromArray(normals.array, i).multiplyScalar(10).add(a);
        }, 0xFF00FF);
    }
}*/

registerTickFunction('updateCurtainNormals', () => {
    geometry.computeVertexNormals();

    normalDebugUpdateGroup.call();
}, {
    before: ['render'],
    after: ['updateCurtainPositions'],
});
