import { Router } from "express";


import { userMiddleware } from "../middlewares/user.middleware";
import { activeDungeonRaid, claimDungeonReward, gameAccountInfo, gameDungeonList, startDungeonRaid } from "../controllers/game.controller";

const gameRoute = Router();


gameRoute.post('/me', userMiddleware,gameAccountInfo)
gameRoute.post('/', userMiddleware,gameDungeonList)//fetch dungeons
gameRoute.post('/', userMiddleware,activeDungeonRaid)//fetch active raid
gameRoute.post('/', userMiddleware,startDungeonRaid)//enter raid 
gameRoute.post('/', userMiddleware,claimDungeonReward)
export default gameRoute;