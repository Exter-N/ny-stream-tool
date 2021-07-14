import { Vector2, WebGLRenderer, WebGLRenderTarget } from "three";
import PostProcessingPass, { PostProcessingPassParent } from "./pass";

function setSize(pass: PostProcessingPass | undefined, width: number, height: number): void {
    if (null == pass) {
        return;
    }
    for (const input of pass.inputs) {
        setSize(input, width, height);
    }
    pass.setSize(width, height);
}

function render(time: number, deltaTime: number, renderer: WebGLRenderer, pass: PostProcessingPass | undefined, target: WebGLRenderTarget | null, parentPass: PostProcessingPassParent | undefined, index: number): void {
    if (null == pass || null != parentPass && !parentPass.shouldRenderInput(index, time, deltaTime, renderer)) {
        return;
    }
    if (pass.needsUpdate) {
        pass.update();
    }
    for (let i = 0; i < pass.inputTargets.length; ++i) {
        render(time, deltaTime, renderer, pass.inputs[i], pass.inputTargets[i], pass, i);
    }
    if (null != parentPass) {
        parentPass.willRenderInput(index, time, deltaTime, renderer);
    }
    try {
        renderer.setRenderTarget(target);
        pass.render(time, deltaTime, renderer);
    } finally {
        if (null != parentPass) {
            parentPass.didRenderInput(index, time, deltaTime, renderer);
        }
    }
}

export default class PostProcessor {
    readonly renderer: WebGLRenderer;
    cssWidth: number;
    cssHeight: number;
    pixelRatio: number;
    finalPass: PostProcessingPass | undefined;
    finalPassParent: PostProcessingPassParent | undefined;
    constructor(renderer: WebGLRenderer) {
        this.renderer = renderer;
        const { x, y } = renderer.getSize(new Vector2());
        this.cssWidth = x;
        this.cssHeight = y;
        this.pixelRatio = renderer.getPixelRatio();
        this.finalPass = undefined;
        this.finalPassParent = undefined;
    }

    get width(): number {
        return this.cssWidth * this.pixelRatio;
    }
    get height(): number {
        return this.cssHeight * this.pixelRatio;
    }
    get aspect(): number {
        return this.cssWidth / this.cssHeight;
    }

    append(pass: PostProcessingPass): void {
        if (null != this.finalPass && pass.inputs.length > 0) {
            pass.inputs[0] = this.finalPass;
        }
        this.finalPass = pass;
    }

    setSizeAndPixelRatio(cssWidth: number, cssHeight: number, pixelRatio: number): void {
        this.cssWidth = cssWidth;
        this.cssHeight = cssHeight;
        this.pixelRatio = pixelRatio;
        this.renderer.setSize(cssWidth, cssHeight);
        this.renderer.setPixelRatio(pixelRatio);
        setSize(this.finalPass, cssWidth * pixelRatio, cssHeight * pixelRatio);
    }

    render(time: number, deltaTime: number): void {
        render(time, deltaTime, this.renderer, this.finalPass, null, this.finalPassParent, 0);
    }
}