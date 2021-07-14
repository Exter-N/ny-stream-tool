import { createApp } from 'vue';
import App from './App.vue';
import api from './api';

api?.addEventListener('server.spawn', () => {
    console.log('Server spawned');
});

api?.addEventListener('server.exit', () => {
    console.log('Server exited');
});

api?.addEventListener('server.stdout', data => {
    console.log('Server stdout', data);
});

api?.addEventListener('server.stderr', data => {
    console.log('Server stderr', data);
});

createApp(App).mount('#app');