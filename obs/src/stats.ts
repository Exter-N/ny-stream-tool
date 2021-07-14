import Stats from 'stats.js';
import { isObs } from './obs';

const stats = new Stats();
stats.dom.classList.add('stats');
if (isObs) {
    stats.dom.classList.add('hidden');
}

let visible = false;
export function show() {
    if (!visible) {
        visible = true;
        document.body.appendChild(stats.dom);
    }
}

export default stats;