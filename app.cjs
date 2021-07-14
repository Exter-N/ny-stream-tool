const { app, BrowserWindow, ipcMain } = require('electron');
const { join } = require('path');
const { spawn } = require('child_process');

let canSpawnServer = true;
let server = null;

function broadcast(channel, ...args) {
    for (const win of BrowserWindow.getAllWindows()) {
        win.webContents.send(channel, ...args);
    }
}

function spawnServer() {
    if (!canSpawnServer) {
        return;
    }

    broadcast('server.spawn');
    server = spawn('node', ['--experimental-specifier-resolution=node', 'server/dist/server/src']);
    server.on('exit', () => {
        broadcast('server.exit');
        setTimeout(spawnServer, 1000);
    });
    server.stdout.on('data', chunk => {
        broadcast('server.stdout', chunk.toString('utf-8'));
    });
    server.stderr.on('data', chunk => {
        broadcast('server.stderr', chunk.toString('utf-8'));
    });
}

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 450,
        resizable: false,
        maximizable: false,
        darkTheme: true,
        webPreferences: {
            preload: join(__dirname, 'app', 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    win.setMenuBarVisibility(false);

    win.loadFile(join(__dirname, 'app', 'index.html'));
}

app.whenReady().then(() => {
    spawnServer();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    app.quit();
});

ipcMain.handle('server.restart', () => {
    server?.stdin?.end();
});

ipcMain.handle('quit', () => {
    app.quit();
});

app.on('will-quit', () => {
    canSpawnServer = false;
    server?.stdin?.end();
});