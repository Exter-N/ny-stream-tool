import { Mesh, MeshBasicMaterial, PlaneGeometry } from "three";
import scene from ".";

export const material = new MeshBasicMaterial({
    transparent: true,
});

const mesh = new Mesh(new PlaneGeometry(1, 1), material);
mesh.position.set(0.5, 0.5, -0.2);

scene.add(mesh);