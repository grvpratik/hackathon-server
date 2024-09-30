import { prisma } from "..";
import { Request, Response } from "express";
import { getInitData } from "../middleware";
import { UserService } from "../services/user.service";
import { getTasksForUser } from "../services/task.service";



export async function userAuthentication(req: Request, res: Response) {
    const client = getInitData(res);

    // Ensure client data is valid
    if (!client?.user?.id) {
        return res.status(400).json({ error: "Invalid client data" });
    }

    try {
        UserService.checkOrCreateUser(client.user.id, client.user.firstName, client.user.username)

        // const token = createSessionToken(user.id, user.telegram_id)

        return res.status(200).json({
            success: true,

        });
    } catch (error) {
        console.error("Error during session creation:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function userTaskList(req: Request, res: Response) {
    const userData = getInitData(res);
    const chatId = userData?.user?.id;
    if (!chatId) {
        res.status(404).json({ message: "Telegram user id not found" })
        return
    }

    try {
        const user = await UserService.findUserByTelegramId(chatId)

        if (!user) {
            res.status(404).json({ message: "user not found" })
            return
        }

        const taskList = await getTasksForUser(user.id)
        res.status(200).json(taskList)
    }
    catch (error) {
        console.error("Error during session creation:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function userInfo(req: Request, res: Response) {
    try {
        const tgData = getInitData(res)
        const user = await UserService.findUserByTelegramId(tgData?.user!.id!)
        if (!user) {
            res.status(500).json({ message: "User not found" })
        }
        res.status(200).json({
            user_id: user?.id,
            points: user?.points,
            address: user?.address
        })
    }
    catch (error) {
        console.error("Error during session creation:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}