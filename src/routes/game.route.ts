import { Router } from "express";


import { userMiddleware } from "../middlewares/user.middleware";

const gameRoute = Router();


gameRoute.post('/', userMiddleware,)//fetch game account
gameRoute.post('/', userMiddleware,)//fetch dungeons
gameRoute.post('/', userMiddleware,)//fetch active raid
gameRoute.post('/', userMiddleware,)//enter raid 
gameRoute.post('/', userMiddleware,)
export default gameRoute;