import { Router } from "express";
import { prisma } from "..";



const router = Router();

router.get("/", async (req, res) => {
    const taskList = await prisma.task.findMany()

    res.status(200).json(taskList)

})


router.get("/submit", async (req, res) => {
    const taskList = await prisma.task.findMany()

    res.status(200).json(taskList)

})


export default router