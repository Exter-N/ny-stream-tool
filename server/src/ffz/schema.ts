export interface Room {
    _id: number;
    twitch_id: number;
    id: string;
    is_group: boolean;
    display_name: string;
    set: number;
    moderator_badge: any;
    vip_badge: any;
    mod_urls: any;
    user_badges: {
        [id: string]: string[];
    };
    user_badge_ids: {
        [id: string]: number[];
    };
    css: any;
}

export interface Emote {
    id: number;
    name: string;
    height: number;
    width: number;
    public: boolean;
    hidden: boolean;
    modifier: boolean;
    offset: any;
    margins: any;
    css: any;
    owner: {
        _id: number;
        name: string;
        display_name: string;
    };
    urls: {
        '1': string;
        '2'?: string;
        '4'?: string;
    };
    status: number;
    usage_count: number;
    created_at: string;
    last_updated: string;
}

export interface EmoteSet {
    id: number;
    _type: number;
    icon: any;
    title: string;
    css: any;
    emoticons: Emote[];
}

export interface DefaultSetData {
    default_sets: number[];
    sets: {
        [id: string]: EmoteSet;
    };
}

export interface RoomData {
    room: Room;
    sets: {
        [id: string]: EmoteSet;
    };
}