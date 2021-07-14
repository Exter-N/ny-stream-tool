import fetch from "node-fetch";
import { StaticAuthProvider, AccessToken, AuthProvider } from 'twitch-auth';
import { ApiClient } from 'twitch';
import DataElement from '../data';

interface HelixAuthData {
    client: string;
    access: string;
    refresh: string;
}

const authElement = new DataElement<HelixAuthData>('helix-auth', element => Object.assign({ client: '', access: '', refresh: '' }, element ?? { }));

const auth = authElement.read();

export const authProvider = new StaticAuthProvider(auth.client, auth.access, undefined, 'user');

async function refresh(): Promise<void> {
    if (null == auth.refresh) {
        throw new Error('No refresh token');
    }

    const response = await fetch('https://twitchtokengenerator.com/api/refresh/' + auth.refresh);
    const body = await response.json();
    if (!body.success) {
        throw new Error('Refresh failed');
    }
    // auth.client = body.client_id;
    auth.access = body.token;
    auth.refresh = body.refresh;
    authElement.write(auth);
}

(authProvider as AuthProvider).refresh = async function () {
    await refresh();

    const token = new AccessToken({
        access_token: auth.access,
        refresh_token: auth.refresh,
    });
    authProvider.setAccessToken(token);

    return token;
};

export const channelId = parseInt(process.env.CHANNEL_ID!, 10);

const api = new ApiClient({
    authProvider,
});

export default api;