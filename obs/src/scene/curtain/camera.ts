import { PerspectiveCamera } from "three";

const camera = new PerspectiveCamera(35, innerWidth / innerHeight, 10, 1000);

camera.position.set(0, 0, 600);

camera.lookAt(0, 0, 0);

export default camera;