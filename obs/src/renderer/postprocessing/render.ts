import { Camera, Object3D } from "three";
import PostProcessor from ".";
import PostProcessingPass from "./pass";

export default class RenderPass extends PostProcessingPass {
    constructor(postProcessor: PostProcessor, scene: Object3D, camera: Camera) {
        super(postProcessor, scene, camera, [ ]);
    }
}