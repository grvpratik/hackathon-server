
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




router.get("/submission", async (req, res) => {
    // Function to perform OCR on image

    try {
        const worker = await createWorker('eng');
        const ret = await worker.recognize('https://api.telegram.org/file/bot6494748312:AAHjVKXP8OC_14WB_6w6kzGWHv7kSWkL0dc/photos/file_2.jpg');
        console.log(ret.data.text);
        await worker.terminate();
    } catch (error) {
        console.error(error)
    }

    res.status(200).json({
        success: true,
        message: "iamge text here "
    })
})







router.post("/submission", userMiddleware, async (req, res) => {


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

router.post("/task", authMiddleware, async (req, res) => {
    //@ts-ignore
    const userId = req.userId
    // validate the inputs from the user;
    const body = req.body;

    // const body = createTaskInput.safeParse(body);
    console.log({ body })
    // const user = await prismaClient.user.findFirst({
    //     where: {
    //         id: userId
    //     }
    // })

    // // if (!body.success) {
    // //     return res.status(411).json({
    // //         message: "You've sent the wrong inputs"
    // //     })
    // // }

    // const transaction = await connection.getTransaction(body.data.signature, {
    //     maxSupportedTransactionVersion: 1
    // });

    // console.log(transaction);

    // if ((transaction?.meta?.postBalances[1] ?? 0) - (transaction?.meta?.preBalances[1] ?? 0) !== 100000000) {
    //     return res.status(411).json({
    //         message: "Transaction signature/amount incorrect"
    //     })
    // }

    // if (transaction?.transaction.message.getAccountKeys().get(1)?.toString() !== PARENT_WALLET_ADDRESS) {
    //     return res.status(411).json({
    //         message: "Transaction sent to wrong address"
    //     })
    // }

    // if (transaction?.transaction.message.getAccountKeys().get(0)?.toString() !== user?.address) {
    //     return res.status(411).json({
    //         message: "Transaction sent to wrong address"
    //     })
    // }
    // // was this money paid by this user address or a different address?

    // // parse the signature here to ensure the person has paid 0.1 SOL
    // // const transaction = Transaction.from(body.data.signature);

    // let response = await prismaClient.$transaction(async tx => {

    //     const response = await tx.task.create({
    //         data: {
    //             title: body.data.title ?? DEFAULT_TITLE,
    //             amount: 0.1 * TOTAL_DECIMALS,
    //             //TODO: Signature should be unique in the table else people can reuse a signature
    //             signature: body.data.signature,
    //             user_id: userId
    //         }
    //     });

    //     // await tx.option.createMany({
    //     //     data: body.data.options.map(x => ({
    //     //         image_url: x.imageUrl,
    //     //         task_id: response.id
    //     //     }))
    //     // })

    //     return response;

    // })

    // res.json({
    //     id: response.id
    // })

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