
import { Platforms, PrismaClient, TaskStatus, TxnStatus } from "@prisma/client";
import { Router } from "express";



import { authMiddleware, getInitData, userMiddleware } from "../middleware";


import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { prisma } from "..";
import { secret } from './payer';
import axios from "axios";
import { createWorker } from "tesseract.js";

// const connection = new Connection(process.env.RPC_URL ?? "");

// const PARENT_WALLET_ADDRESS = "2KeovpYvrgpziaDsq8nbNMP4mc48VNBVXb5arbqrg9Cq";

// const DEFAULT_TITLE = "Select the most clickable thumbnail";
// async function createSessionToken(id: string, tg_id: any) {
//     const jwt = await new jose.SignJWT({ id, tg_id })
//         .setProtectedHeader({ alg: 'HS256' })
//         .setIssuedAt()
//         .setExpirationTime('1day')
//         .sign(secret)

//     return jwt
// }


const router = Router();











router.post("/auth/session", userMiddleware, async (req, res) => {
    const client = getInitData(res);

    // Ensure client data is valid
    if (!client?.user?.id) {
        return res.status(400).json({ error: "Invalid client data" });
    }

    try {
        // Find the user based on the telegram_id
        let user = await prisma.user.findFirst({
            where: { telegram_id: client.user.id },
        });

        let newUser = false;

        // If user does not exist, create one
        if (!user) {
            user = await prisma.user.create({
                data: {
                    telegram_id: client.user.id,
                    first_name: client.user.firstName ?? '',
                    last_name: client.user.username ?? '',
                },
            });
            newUser = true;
        }
        // const token = createSessionToken(user.id, user.telegram_id)
        // Respond with user data directly
        return res.status(200).json({
            success: true,
            newUser,
        });
    } catch (error) {
        console.error("Error during session creation:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});




router.get("/test", async (req, res) => {
   
    res.status(200).json({message:"success"})
})






router.post("/list", userMiddleware, async (req, res) => {
    const taskList = await prisma.task.findMany({
        where: {
            status: TaskStatus.Active
        }
    })
    res.status(200).json(taskList)
})

const BOT_TOKEN = '6494748312:AAHjVKXP8OC_14WB_6w6kzGWHv7kSWkL0dc'; // Consider moving to env variables
const POINTS = 200;

const sendMessage = async (chatId: number, message: string) => {
    const apiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    try {
        await axios.post(apiUrl, {
            chat_id: chatId,
            text: message
        });
    } catch (error) {
        console.error('Error sending message:', error);
        throw new Error('Telegram message failed to send.');
    }
};

router.post("/:taskId/submit", userMiddleware, async (req, res, next) => {
    const taskId = req.params.taskId;
    const userData = getInitData(res);
    const chatId = userData?.user?.id;

    if (!chatId) {
        return res.status(400).json({ error: 'Chat ID is required.' });
    }

    try {
        const user = await prisma.user.findFirst({
            where: { telegram_id: chatId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        await prisma.proof.deleteMany({
            where: {
                telegram_id: chatId,
                userId: user.id
            }
        });

        // let submission = await prisma.submission.findFirst({
        //     where: {
        //         user_id: user.id,
        //         task_id: taskId,
        //     }
        // });


        const submission = await prisma.proof.create({
            data: {
                telegram_id:chatId,
                userId: user.id,
                taskId: taskId,
                amount: POINTS,

            }
        });


        await sendMessage(chatId, `Successfully created submission\nID: ${submission.id}\nPlease upload your proof.`);
        return res.status(201).json({ submissionId: submission.id });

    } catch (error) {
        next(error);
    }
});






router.post("/me", userMiddleware, async (req, res) => {
    const tgData = getInitData(res)
    const user = await prisma.user.findFirst({
        where: {
            telegram_id: tgData?.user?.id
        }
    })
    if (!user) {
        res.status(500).json({ message: "User not found" })
    }
    res.status(200).json({
        user_id: user?.id,
        points: user?.points,
        address: user?.address
    })
});
router.get("/task", async (req, res) => {
    console.log("task")
    // await prismaClient.task.findMany({
    //     where: {
    //         user_id:1
    //     }
    // })

    //    const user= await prismaClient.user.create({
    //         data: {
    //             address: '0x1234567890123456789012345678901234567893', // Example Ethereum address
    //         },
    //     })

    // console.log('Created user:', user)
    //     const task = await prismaClient.task.create({
    //         data: {
    //             platform: Platforms.Twitter,
    //             task_name: 'Share our latest blog post',
    //             amount: 1000000000, // 1 SOL in lamports
    //             signature: 'dummy_signature_12323',
    //             user_id: 2,
    //         },
    //     })
    //     const user = await prismaClient.user.findMany()
    //     console.log(user)
    // // const task  = await prismaClient.task.findMany()
    //     console.log('Created task:', task)
    // const worker = await prismaClient.worker.findMany()
    // console.log({worker})
    // const tasks = await prismaClient.task.findMany();
    // res.json({tasks})
    res.send("hii")
})


// router.get("/presignedUrl", authMiddleware, async (req, res) => {
//     // @ts-ignore
//     const userId = req.userId;

//     const { url, fields } = await createPresignedPost(s3Client, {
//         Bucket: 'hkirat-cms',
//         Key: `fiver/${userId}/${Math.random()}/image.jpg`,
//         Conditions: [
//             ['content-length-range', 0, 5 * 1024 * 1024] // 5 MB max
//         ],
//         Expires: 3600
//     })

//     res.json({
//         preSignedUrl: url,
//         fields
//     })

// })

router.post("/signin", async (req, res) => {
    //     const { publicKey, signature } = req.body;
    //     const message = new TextEncoder().encode("Sign into mechanical turks");

    //     const result = nacl.sign.detached.verify(
    //         message,
    //         new Uint8Array(signature.data),
    //         new PublicKey(publicKey).toBytes(),
    //     );


    //     if (!result) {
    //         return res.status(411).json({
    //             message: "Incorrect signature"
    //         })
    //     }
    //     console.log({result})
    //     const existingUser = await prismaClient.user.findFirst({
    //         where: {
    //             address: publicKey
    //         }
    //     })

    //     if (existingUser) {
    //         const token = jwt.sign({
    //             userId: existingUser.id
    //         }, JWT_SECRET)
    //         console.log({ token })
    //         res.json({
    //             token
    //         })
    //     } else {
    //         const user = await prismaClient.user.create({
    //             data: {
    //                 address: publicKey,
    //             }
    //         })

    //         const token = jwt.sign({
    //             userId: user.id
    //         }, JWT_SECRET)
    // console.log({token})
    //         res.json({
    //             token
    //         })
    //     }

});

export default router;