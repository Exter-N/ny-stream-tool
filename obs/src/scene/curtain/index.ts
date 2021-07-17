import { Scene, Vector3 } from "three";
import { addPointLight, addLine } from "../../../../util/simple-objects";

const scene = new Scene();

export const light = addPointLight(scene, new Vector3(-500, 500, 1000), 15000000, 0xFFFFFF);

// addLine(scene, new Vector3(0, 0, 0), new Vector3(100, 0, 0), 0xFF0000);
// addLine(scene, new Vector3(0, 0, 0), new Vector3(0, 100, 0), 0x00FF00);
// addLine(scene, new Vector3(0, 0, 0), new Vector3(0, 0, 100), 0x0000FF);

export default scene;
