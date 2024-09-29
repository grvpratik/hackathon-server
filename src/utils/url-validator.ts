import { Platform } from '../types';

const platformDomains: Record<Platform, string> = {
    [Platform.YOUTUBE]: 'youtube.com',
    [Platform.TWITTER]: 'twitter.com',
    [Platform.DISCORD]: 'discord.gg',
    [Platform.TELEGRAM]: 't.me',
};

export function validateUrl(url: string, platform: Platform): boolean {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.hostname.includes(platformDomains[platform]);
    } catch {
        return false;
    }
}
