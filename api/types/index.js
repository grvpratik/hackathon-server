"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.State = exports.Action = exports.Platform = void 0;
var Platform;
(function (Platform) {
    Platform["YOUTUBE"] = "youtube";
    Platform["TWITTER"] = "twitter";
    Platform["DISCORD"] = "discord";
    Platform["TELEGRAM"] = "telegram";
})(Platform || (exports.Platform = Platform = {}));
var Action;
(function (Action) {
    Action["SUBSCRIBE"] = "subscribe";
    Action["LIKE_COMMENT"] = "like_comment";
    Action["FOLLOW"] = "follow";
    Action["LIKE_RETWEET"] = "like_retweet";
    Action["JOIN"] = "join";
})(Action || (exports.Action = Action = {}));
var State;
(function (State) {
    State["INITIAL"] = "initial";
    State["PLATFORM_SELECTED"] = "platform_selected";
    State["ACTION_SELECTED"] = "action_selected";
    State["URL_REQUIRED"] = "url_required";
    State["PRICING"] = "pricing";
    State["CONFIRMATION"] = "confirmation";
})(State || (exports.State = State = {}));
// Configuration
exports.config = {
    KEYWORDS: ["posts", "videos", "links", "You", "following", "Videos", "Shorts", "Podcasts", "views", "Home", "others", "followers", "Pinned", "Replies", "joined", "highlights", "Follow", "Subscribe", "YouTube", "Like", "Comment", "Twitter"],
    TESSERACT_LANG: "eng",
    MIN_CONFIDENCE: 70,
};
