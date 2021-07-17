import { WebGLRenderer } from 'three';
import curtainCamera from "../scene/curtain/camera";
import nightSkyCamera from "../scene/night-sky/camera";
import camera from "../scene/main/camera";
import curtainScene from "../scene/curtain";
import nightSkyScene, { mapLoaded } from "../scene/night-sky";
import scene from '../scene/main';
import { material as curtainMaterial } from '../scene/curtain/curtain';
import { material as curtainInMainMaterial } from '../scene/main/curtain';
import { registerTickFunction } from './tick';
import PostProcessor from './postprocessing';
import RenderPass from './postprocessing/render';

export const renderer = new WebGLRenderer({ antialias: true, alpha: true });
renderer.physicallyCorrectLights = true;
renderer.setClearColor(0x333333, 0);

const postprocessing = new PostProcessor(renderer);

function onResize() {
    postprocessing.setSizeAndPixelRatio(innerWidth, innerHeight, devicePixelRatio);
}

onResize();
addEventListener('resize', onResize, false);

const nightSkyPass = new RenderPass(postprocessing, nightSkyScene, nightSkyCamera);
nightSkyPass.layers = 1;
nightSkyPass.cached = true;
mapLoaded.then(() => {
    nightSkyPass.needsRender = true;
});

const nightSkyEmissivePass = new RenderPass(postprocessing, nightSkyScene, nightSkyCamera);
nightSkyEmissivePass.layers = 2;

const curtainPass = new RenderPass(postprocessing, curtainScene, curtainCamera, [ { }, { } ]);
curtainPass.inputs[0] = nightSkyPass;
curtainPass.inputs[1] = nightSkyEmissivePass;
curtainMaterial.map = curtainPass.inputTargets[0].texture;
curtainMaterial.emissiveMap = curtainPass.inputTargets[1].texture;

const mainPass = new RenderPass(postprocessing, scene, camera, [ { } ]);
mainPass.inputs[0] = curtainPass;
curtainInMainMaterial.map = mainPass.inputTargets[0].texture;

postprocessing.append(mainPass);

document.getElementById('three')!.appendChild(renderer.domElement);

registerTickFunction('render', (time, deltaTime) => {
    curtainPass.needsRender = curtainInMainMaterial.opacity > 0;
    postprocessing.render(time, deltaTime);
});