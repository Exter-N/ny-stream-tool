import { ChatUserstate } from "tmi.js";
import bots from "./bots";
import room from "./room";

export default function isBot(userstate: ChatUserstate): boolean {
    return null != userstate.username && bots.includes(userstate.username)
        || null != userstate['user-id'] && room.room.user_badge_ids?.[2]?.includes(Number(userstate['user-id']))
}