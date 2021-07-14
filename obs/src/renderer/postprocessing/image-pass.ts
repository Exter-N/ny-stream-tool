import { Material, Mesh, OrthographicCamera, PlaneBufferGeometry, WebGLRenderTargetOptions } from "three";
import PostProcessor from ".";
import PostProcessingPass from "./pass";

export default abstract class ImagePostProcessingPass extends PostProcessingPass {
    material: Material;
    protected constructor(postProcessor: PostProcessor, material: Material, inputOptions: (WebGLRenderTargetOptions | undefined)[]) {
        const mesh = new Mesh(new PlaneBufferGeometry(2, 2), material);
        const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
        super(postProcessor, mesh, camera, inputOptions);
        this.material = material;
    }
    protected setMaterial(material: Material): void {
        this.material = material;
        (this.scene as Mesh).material = material;
    }
}