import { BufferGeometry, Group, Line, LineBasicMaterial, PointLight, Scene, Vector3 } from "three";

const scene = new Scene();

function addPointLight(group: Scene | Group, position: Vector3, intensity: number, color: number) {
    const light = new PointLight(color, intensity, 0, 2);
    light.position.set(position.x, position.y, position.z);
    light.layers.enableAll();
    light.castShadow = true;

    // const sphere = new Mesh(new SphereGeometry(1), new MeshBasicMaterial({ color }));
    // sphere.position.set(position.x, position.y, position.z);

    group.add(light/*, sphere*/);
}

// addPointLight(scene, new Vector3(50, 100, 50), 25000, 0xFFFFFF);
// addPointLight(scene, new Vector3(-50, -100, -50), 25000, 0xFFFFFF);

function addLine(group: Scene | Group, a: Vector3, b: Vector3, color: number) {
    const line = new Line(
        new BufferGeometry().setFromPoints([ a, b ]),
        new LineBasicMaterial({ color }));
    line.renderOrder = 1000;
    line.layers.enableAll();

    scene.add(line);
}

// addLine(scene, new Vector3(0, 0, 0), new Vector3(1, 0, 0), 0xFF0000);
// addLine(scene, new Vector3(0, 0, 0), new Vector3(0, 1, 0), 0x00FF00);
// addLine(scene, new Vector3(0, 0, 0), new Vector3(0, 0, 1), 0x0000FF);

export default scene;
