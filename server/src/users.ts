import { BadgeInfo, Badges } from "tmi.js";
import DataElement from "./data";
import { addStopHandler } from "./stop";
import Transition from "./transition";
import { UserNameResolvable, UserIdResolvable } from 'twitch';
import api from "./twitch/api";

export interface User {
    id: string;
    name: string;
    displayName: string;
    badges: Badges;
    badgeInfo: BadgeInfo;
    xp: number;
    fineCurrency: number;
    coarseCurrency: number;
    achievements: string[];
}

const element = new DataElement<{ [id: string]: User; }>('users', data => data ?? { });

const users = element.read();

const saver = Transition.debounce(300, () => {
    console.log('Saving users');
    element.write(users);
});

export function getUserById(id: string): User | undefined {
    if (users.hasOwnProperty(id)) {
        return users[id];
    } else {
        return undefined;
    }
}

export function getUserByName(name: string): User | undefined {
    name = name.toLowerCase();
    for (const user of Object.values(users)) {
        if (user.name === name) {
            return user;
        }
    }

    return undefined;
}

export function getOrAddUser(id: string, name: string, displayName: string): User {
    if (users.hasOwnProperty(id)) {
        const user = users[id];
        if (user.name !== name || user.displayName !== displayName) {
            user.name = name;
            user.displayName = displayName;
            saveUsers(true);
        }

        return user;
    } else {
        const newUser: User = {
            id,
            name,
            displayName,
            badges: { },
            badgeInfo: { },
            xp: 0,
            fineCurrency: 0,
            coarseCurrency: 0,
            achievements: [],
        };

        users[id] = newUser;
        saveUsers(true);

        return newUser;
    }
}

export async function getOrAddUserById(id: UserIdResolvable): Promise<User | null> {
    const helixUser = await api.helix.users.getUserById(id);
    if (null == helixUser) {
        return null;
    }

    return getOrAddUser(helixUser.id, helixUser.name, helixUser.displayName);
}

export async function getOrAddUserByName(name: UserNameResolvable): Promise<User | null> {
    const helixUser = await api.helix.users.getUserByName(name);
    if (null == helixUser) {
        return null;
    }

    return getOrAddUser(helixUser.id, helixUser.name, helixUser.displayName);
}

let savePending = false;

export function saveUsers(now: boolean): void {
    if (now) {
        saver.start();
    } else {
        savePending = true;
    }
}

const saveInterval = setInterval(() => {
    if (savePending) {
        savePending = false;
        saver.start();
    }
}, 60000);

addStopHandler(() => {
    clearInterval(saveInterval);
    if (savePending) {
        savePending = false;
        element.write(users);
    }
});

export default users;