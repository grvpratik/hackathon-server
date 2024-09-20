import nacl from "tweetnacl";
import { Platforms, PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken"

import { JWT_SECRET, TOTAL_DECIMALS } from "../config";
import { authMiddleware } from "../middleware";


import { Connection, PublicKey, Transaction } from "@solana/web3.js";

// const connection = new Connection(process.env.RPC_URL ?? "");

// const PARENT_WALLET_ADDRESS = "2KeovpYvrgpziaDsq8nbNMP4mc48VNBVXb5arbqrg9Cq";

// const DEFAULT_TITLE = "Select the most clickable thumbnail";



const router = Router();



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
console.log({body})
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