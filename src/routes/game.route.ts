import { Router } from "express";


import { userMiddleware } from "../middlewares/user.middleware";
import {  claimDungeonReward, gameAccountInfo,  gameDungeonList,  getActiveRaids,  startDungeonRaid } from "../controllers/game.controller";

const gameRoute = Router();


gameRoute.get('/me', gameAccountInfo)
gameRoute.get('/dungeons', gameDungeonList)//fetch dungeons
gameRoute.get('/raid/active', getActiveRaids)//fetch active raid
gameRoute.get('/dungeon/start', startDungeonRaid)//enter raid 
gameRoute.get('/', claimDungeonReward)
export default gameRoute;