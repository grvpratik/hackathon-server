import { Router } from "express";


import { userMiddleware } from "../middlewares/user.middleware";
import {  claimDungeonReward, gameAccountInfo,  gameDungeonList,  getActiveRaids,  startDungeonRaid, tokenMetaData } from "../controllers/game.controller";

const gameRoute = Router();


gameRoute.post('/me', userMiddleware, gameAccountInfo)
gameRoute.get('/:tokenId/info', tokenMetaData)
gameRoute.post('/dungeons', userMiddleware, gameDungeonList)//fetch dungeons
gameRoute.post('/raid/active', userMiddleware, getActiveRaids)//fetch active raid
gameRoute.post('/:dungeonId/start', userMiddleware, startDungeonRaid)//enter raid 
gameRoute.post('/:raidId/claim', userMiddleware, claimDungeonReward)
export default gameRoute;