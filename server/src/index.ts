import { crash, stop } from './stop';
import { listen } from './server';
import './ws';
import './twitch';
import './obs';

process.stdin.on('data', data => { });
process.stdin.on('end', () => stop({ graceful: true, reason: 'stdin.end', detail: null }));

process.on('SIGINT', () => stop({ graceful: true, reason: 'SIGINT', detail: null }));
process.on('SIGHUP', () => stop({ graceful: true, reason: 'SIGHUP', detail: null }));
process.on('SIGTERM', () => stop({ graceful: true, reason: 'SIGTERM', detail: null }));
process.on('uncaughtException', e => crash({ reason: 'uncaughtException', detail: e }));
process.on('unhandledRejection', e => crash({ reason: 'unhandledRejection', detail: e }));

listen();