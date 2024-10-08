"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUrl = validateUrl;
const types_1 = require("../types");
const platformDomains = {
    [types_1.Platform.YOUTUBE]: 'youtube.com',
    [types_1.Platform.TWITTER]: 'twitter.com',
    [types_1.Platform.DISCORD]: 'discord.gg',
    [types_1.Platform.TELEGRAM]: 't.me',
};
function validateUrl(url, platform) {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.hostname.includes(platformDomains[platform]);
    }
    catch (_a) {
        return false;
    }
}
