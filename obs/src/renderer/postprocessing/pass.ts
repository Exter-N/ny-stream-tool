import { Camera, Object3D, PerspectiveCamera, WebGLRenderer, WebGLRenderTarget, WebGLRenderTargetOptions } from "three";
import PostProcessor from ".";

function setCameraAspect(camera: Camera, aspect: number) {
    if (camera instanceof PerspectiveCamera) {
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
    }
}

export interface PostProcessingPassParent {
    shouldRenderInput(index: number, time: number, deltaTime: number, renderer: WebGLRenderer): boolean;
    willRenderInput(index: number, time: number, deltaTime: number, renderer: WebGLRenderer): void;
    didRenderInput(index: number, time: number, deltaTime: number, renderer: WebGLRenderer): void;
}

export default abstract class PostProcessingPass implements PostProcessingPassParent {
    readonly inputTargets: readonly WebGLRenderTarget[];
    readonly inputs: (PostProcessingPass | undefined)[];
    readonly scene: Object3D;
    readonly camera: Camera;
    needsUpdate: boolean;

    protected constructor(postProcessor: PostProcessor, scene: Object3D, camera: Camera, inputOptions: (WebGLRenderTargetOptions | WebGLRenderTarget | undefined)[]) {
        this.inputTargets = inputOptions.map(opts => (opts instanceof WebGLRenderTarget) ? opts : new WebGLRenderTarget(postProcessor.cssWidth * postProcessor.pixelRatio, postProcessor.cssHeight * postProcessor.pixelRatio, opts));
        this.inputs = new Array(inputOptions.length);
        this.scene = scene;
        this.camera = camera;
        this.needsUpdate = false;
        setCameraAspect(camera, postProcessor.aspect);
    }

    setSize(width: number, height: number): void {
        for (const target of this.inputTargets) {
            target.setSize(width, height);
        }
        setCameraAspect(this.camera, width / height);
    }
    update(): void {
    }

    shouldRenderInput(index: number, time: number, deltaTime: number, renderer: WebGLRenderer): boolean {
        return true;
    }
    willRenderInput(index: number, time: number, deltaTime: number, renderer: WebGLRenderer): void {
    }
    didRenderInput(index: number, time: number, deltaTime: number, renderer: WebGLRenderer): void {
    }

    render(time: number, deltaTime: number, renderer: WebGLRenderer): void {
        renderer.render(this.scene, this.camera);
    }
}