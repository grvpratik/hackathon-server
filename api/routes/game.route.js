"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_middleware_1 = require("../middlewares/user.middleware");
const game_controller_1 = require("../controllers/game.controller");
const gameRoute = (0, express_1.Router)();
gameRoute.post('/me', user_middleware_1.userMiddleware, game_controller_1.gameAccountInfo);
gameRoute.get('/:tokenId/info', game_controller_1.tokenMetaData);
gameRoute.post('/dungeons', user_middleware_1.userMiddleware, game_controller_1.gameDungeonList); //fetch dungeons
gameRoute.post('/raid/active', user_middleware_1.userMiddleware, game_controller_1.getActiveRaids); //fetch active raid
gameRoute.post('/:dungeonId/start', user_middleware_1.userMiddleware, game_controller_1.startDungeonRaid); //enter raid 
gameRoute.post('/:raidId/claim', user_middleware_1.userMiddleware, game_controller_1.claimDungeonReward);
exports.default = gameRoute;
