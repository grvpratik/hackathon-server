import { Platforms, TaskStatus } from "@prisma/client";

export enum Platform {
    YOUTUBE = 'youtube',
    TWITTER = 'twitter',
    DISCORD = 'discord',
    TELEGRAM = 'telegram',
}

export enum Action {
    SUBSCRIBE = 'subscribe',
    LIKE_COMMENT = 'like_comment',
    FOLLOW = 'follow',
    LIKE_RETWEET = 'like_retweet',
    JOIN = 'join',
}

export enum State {
    INITIAL = 'initial',
    PLATFORM_SELECTED = 'platform_selected',
    ACTION_SELECTED = 'action_selected',
    URL_REQUIRED = 'url_required',
    PRICING = 'pricing',
    CONFIRMATION = 'confirmation',
}

export interface PlatformAction {
    platform: Platform;
    action: Action | null;
}

export interface UserState {
    state: State;
    platformAction?: PlatformAction;
    url?: string;
    price?: number;
}

export interface TaskCreationData {
    payerId: string;
    platform: Platforms;
    taskName: string;
    amount: number;
    signature: string;
    taskLink: string;
    endDate: Date;
    comment?: string;
}
// Types
export type PhotoSize = {
    file_id: string;
    file_unique_id: string;
    width: number;
    height: number;
    file_size?: number;
};

export type Config = {
    KEYWORDS: string[];
    TESSERACT_LANG: string;
    MIN_CONFIDENCE: number;
};

// Configuration
export const config: Config = {
    KEYWORDS: ["posts", "videos", "links", "You", "following", "Videos", "Shorts", "Podcasts", "views", "Home", "others", "followers", "Pinned", "Replies", "joined", "highlights", "Follow", "Subscribe", "YouTube", "Like", "Comment", "Twitter"],
    TESSERACT_LANG: "eng",
    MIN_CONFIDENCE: 70,
};