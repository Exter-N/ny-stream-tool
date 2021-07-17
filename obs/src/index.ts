import './renderer';
import './scene/main/triangles';
import './scene/main/avatar';
import './sync';
import { show as showStats } from './stats';
import { createApp } from 'vue';
import App from './App.vue';

import * as THREE from 'three';

(window as any).THREE = THREE;

showStats();

createApp(App).mount('#app');