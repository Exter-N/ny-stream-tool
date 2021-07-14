import * as http from 'http';
import app from './app';
import { addStopHandler } from './stop';
import { nPromise } from '../../util/node-promise';

const server = http.createServer(app);

export default server;

addStopHandler(() => nPromise(cb => server.close(cb)));

export function listen(): void {
    server.listen(Number(process.env.PORT) || 9243, '0.0.0.0', () => {
        console.log(`Server started @ ${JSON.stringify(server!.address())}`);
    });
}