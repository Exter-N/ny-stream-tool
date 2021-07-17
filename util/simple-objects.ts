import { BufferGeometry, Group, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, PointLight, Scene, SphereGeometry, Vector3 } from "three";
import MulticastCallback from "./multicast-callback";
import { createBufferAttribute } from "./buffer-attr";

export function addPointLight(group: Scene | Group, position: Vector3, intensity: number, color: number, debugSphere: boolean = false): PointLight {
    const light = new PointLight(color, intensity, 0, 2);
    light.position.set(position.x, position.y, position.z);
    light.layers.enableAll();
    light.castShadow = true;

    group.add(light);

    if (debugSphere) {
        const sphere = new Mesh(new SphereGeometry(1), new MeshBasicMaterial({ color }));
        sphere.position.set(position.x, position.y, position.z);

        group.add(sphere);
    }

    return light;
}

export function addLine(group: Scene | Group, a: Vector3, b: Vector3, color: number): Line {
    const line = new Line(
        new BufferGeometry().setFromPoints([ a, b ]),
        new LineBasicMaterial({ color }));
    line.renderOrder = 1000;
    line.layers.enableAll();

    group.add(line);

    return line;
}

export function addComputedLine<T extends any[]>(group: Scene | Group, updateGroup: MulticastCallback<T>, update: (a: Vector3, b: Vector3, ...extra: T) => void, color: number, ...initExtra: T): Line {
    const geometry = new BufferGeometry();
    const pos = new Float32Array(6);
    const positions = createBufferAttribute(pos, 3);
    const a = new Vector3();
    const b = new Vector3();
    update(a, b, ...initExtra);
    a.toArray(pos, 0);
    b.toArray(pos, 3);
    geometry.setAttribute('position', positions);

    const line = new Line(
        geometry,
        new LineBasicMaterial({ color }));
    line.renderOrder = 1000;
    line.layers.enableAll();

    group.add(line);

    updateGroup.add((...extra) => {
        update(a, b, ...extra);
        if (a.x !== pos[0] || a.y !== pos[1] || a.z !== pos[2] || b.x !== pos[3] || b.y !== pos[4] || b.z !== pos[5]) {
            a.toArray(pos, 0);
            b.toArray(pos, 3);
            positions.needsUpdate = true;
        }
    });

    return line;
}