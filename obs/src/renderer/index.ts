import { WebGLRenderer } from 'three';
import camera from "../camera";
import scene from '../scene';
import { registerTickFunction } from './tick';
import PostProcessor from './postprocessing';
import RenderPass from './postprocessing/render';

export const renderer = new WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x333333, 0);

const postprocessing = new PostProcessor(renderer);

function onResize() {
    postprocessing.setSizeAndPixelRatio(innerWidth, innerHeight, devicePixelRatio);
}

onResize();
addEventListener('resize', onResize, false);

postprocessing.append(new RenderPass(postprocessing, scene, camera));

document.getElementById('three')!.appendChild(renderer.domElement);

registerTickFunction('render', postprocessing.render.bind(postprocessing));