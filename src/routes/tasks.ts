import { Router } from "express";
import { prisma } from "..";
import { TaskStatus } from "@prisma/client";
import { authMiddleware, getInitData, userMiddleware } from "../middleware";



const router = Router();

router.get("/", userMiddleware, async (req, res) => {
    const userData = getInitData(res);
    const chatId = userData?.user?.id;
    const user = await prisma.user.findFirst({
        where: {
        telegram_id:chatId
    }
    })
    if (!user) {
        res.status(404).json({ message: "user not found" })
        return
    }
    const taskList = await prisma.task.findMany({
        where: {
            NOT: {
                submissions: {
                    some: {
                        user_id: user.id
                    }
                }
            },
            status: TaskStatus.Active
        }
    })

    res.status(200).json(taskList)

})


router.get("/submit", async (req, res) => {
    const taskList = await prisma.task.findMany()

    res.status(200).json(taskList)

})


export default router