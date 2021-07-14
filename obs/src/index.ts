import './renderer';
import './scene/triangles';
import './scene/avatar';
import './sync/ws';
import './sync/avatar';
import { show as showStats } from './stats';
import { createApp } from 'vue';
import App from './App.vue';

import * as THREE from 'three';

(window as any).THREE = THREE;

showStats();

createApp(App).mount('#app');