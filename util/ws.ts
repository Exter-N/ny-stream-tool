export type AutoWebSocket = (autoCreate?: boolean) => WebSocket | null;

export function autoWebSocket(url: string, protocols?: string | string[], init?: (ws: WebSocket) => void): AutoWebSocket {
    let ws: WebSocket | null = null;
    return (autoCreate: boolean = true) => {
        if (null == ws && autoCreate) {
            ws = new WebSocket(url, protocols);
            if (null != init) {
                init(ws);
            }
            const onerror = ws.onerror;
            const onclose = ws.onclose;
            ws.onerror = ev => {
                const sock = ws!;
                if (sock.readyState === WebSocket.CLOSED) {
                    ws = null;
                }
                if (null != onerror) {
                    onerror.call(sock, ev);
                }
            };
            ws.onclose = ev => {
                const sock = ws!;
                ws = null;
                if (null != onclose) {
                    onclose.call(sock, ev);
                }
            };
        }

        return ws;
    };
}

export function onWebSocketReady(ws: WebSocket): Promise<WebSocket> {
    return new Promise<WebSocket>((resolve, reject) => {
        switch (ws.readyState) {
            case WebSocket.CONNECTING:
                const onopen = ws.onopen;
                const onerror = ws.onerror;
                const onclose = ws.onclose;
                ws.onopen = ev => {
                    resolve(ws);
                    if (null != onopen) {
                        onopen.call(ws, ev);
                    }
                };
                ws.onerror = ev => {
                    if (ws.readyState === WebSocket.CLOSING || ws.readyState === WebSocket.CLOSED) {
                        reject(new Error('error event in the WebSocket'));
                    }
                    if (null != onerror) {
                        onerror.call(ws, ev);
                    }
                };
                ws.onclose = ev => {
                    reject(new Error('close event in the WebSocket'));
                    if (null != onclose) {
                        onclose.call(ws, ev);
                    }
                };
                break;
            case WebSocket.OPEN:
                resolve(ws);
                break;
            case WebSocket.CLOSING:
            case WebSocket.CLOSED:
                reject(new Error('WebSocket already in CLOSING or CLOSED state'));
                break;
            default:
                reject(new Error('WebSocket in unknown state'));
                break;
        }
    });
}