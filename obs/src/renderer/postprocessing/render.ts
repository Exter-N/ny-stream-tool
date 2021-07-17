import { Camera, Object3D, WebGLRenderTarget, WebGLRenderTargetOptions } from "three";
import PostProcessor from ".";
import PostProcessingPass from "./pass";

export default class RenderPass extends PostProcessingPass {
    constructor(postProcessor: PostProcessor, scene: Object3D, camera: Camera, inputOptions: (WebGLRenderTargetOptions | WebGLRenderTarget | undefined)[] = [ ]) {
        super(postProcessor, scene, camera, inputOptions);
    }
}