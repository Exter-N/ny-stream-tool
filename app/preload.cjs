const { ipcRenderer, contextBridge } = require('electron');

const listeners = {
    'server.spawn': [],
    'server.exit': [],
    'server.stdout': [],
    'server.stderr': [],
};

function dispatchEvent(event, ...args) {
    if (!listeners.hasOwnProperty(event)) {
        return;
    }

    const eventListeners = listeners[event];
    if (!Array.isArray(eventListeners)) {
        return;
    }

    for (const listener of eventListeners) {
        try {
            listener(...args);
        } catch (e) {
            console.error(e);
        }
    }
}

contextBridge.exposeInMainWorld('api', {
    restartServer() {
        ipcRenderer.invoke('server.restart');
    },
    quit() {
        ipcRenderer.invoke('quit');
    },
    addEventListener(event, listener) {
        if (!listeners.hasOwnProperty(event) || !Array.isArray(listeners[event])) {
            return;
        }

        listeners[event].push(listener);
    },
    removeEventListener(event, listener) {
        if (!listeners.hasOwnProperty(event) || !Array.isArray(listeners[event])) {
            return;
        }

        const eventListeners = listeners[event];
        const i = eventListeners.indexOf(listener);
        if (i < 0) {
            return false;
        }

        eventListeners.splice(i, 1);

        return true;
    },
});

ipcRenderer.on('server.spawn', () => {
    dispatchEvent('server.spawn');
});

ipcRenderer.on('server.exit', () => {
    dispatchEvent('server.exit');
});

ipcRenderer.on('server.stdout', (_, data) => {
    dispatchEvent('server.stdout', data);
});

ipcRenderer.on('server.stderr', (_, data) => {
    dispatchEvent('server.stderr', data);
});