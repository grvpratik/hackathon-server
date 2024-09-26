"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const middleware_1 = require("../middleware");
const __1 = require("..");
const axios_1 = __importDefault(require("axios"));
const tesseract_js_1 = require("tesseract.js");
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
const router = (0, express_1.Router)();
router.post("/auth/session", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const client = (0, middleware_1.getInitData)(res);
    // Ensure client data is valid
    if (!((_a = client === null || client === void 0 ? void 0 : client.user) === null || _a === void 0 ? void 0 : _a.id)) {
        return res.status(400).json({ error: "Invalid client data" });
    }
    try {
        // Find the user based on the telegram_id
        let user = yield __1.prisma.user.findFirst({
            where: { telegram_id: client.user.id },
        });
        let newUser = false;
        // If user does not exist, create one
        if (!user) {
            user = yield __1.prisma.user.create({
                data: {
                    telegram_id: client.user.id,
                    first_name: (_b = client.user.firstName) !== null && _b !== void 0 ? _b : '',
                    last_name: (_c = client.user.username) !== null && _c !== void 0 ? _c : '',
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
    }
    catch (error) {
        console.error("Error during session creation:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}));
router.get("/submission", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Function to perform OCR on image
    try {
        const worker = yield (0, tesseract_js_1.createWorker)('eng');
        const ret = yield worker.recognize('https://api.telegram.org/file/bot6494748312:AAHjVKXP8OC_14WB_6w6kzGWHv7kSWkL0dc/photos/file_2.jpg');
        console.log(ret.data.text);
        yield worker.terminate();
    }
    catch (error) {
        console.error(error);
    }
    res.status(200).json({
        success: true,
        message: "iamge text here "
    });
}));
router.post("/submission", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
}));
router.post("/list", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const taskList = yield __1.prisma.task.findMany({
        where: {
            status: client_1.TaskStatus.Active
        }
    });
    res.status(200).json(taskList);
}));
router.post("/:taskId/submit", middleware_1.userMiddleware, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log(req.params.taskId, "id");
    const data = (0, middleware_1.getInitData)(res);
    console.log({ data });
    const chatId = (_a = data === null || data === void 0 ? void 0 : data.user) === null || _a === void 0 ? void 0 : _a.id;
    console.log({ chatId });
    const sendMessage = (chatId, message) => __awaiter(void 0, void 0, void 0, function* () {
        const botToken = '6494748312:AAHjVKXP8OC_14WB_6w6kzGWHv7kSWkL0dc'; // Replace with your bot's token
        const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        try {
            const response = yield axios_1.default.post(apiUrl, {
                chat_id: chatId,
                text: message
            });
            console.log('Message sent successfully:', response.data);
            res.status(200).json({ success: true });
        }
        catch (error) {
            next(error);
            console.error('Error sending message:', error);
        }
    });
    // Example usage:
    yield sendMessage(chatId, req.params.taskId);
}));
router.post("/me", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const tgData = (0, middleware_1.getInitData)(res);
    const user = yield __1.prisma.user.findFirst({
        where: {
            telegram_id: (_a = tgData === null || tgData === void 0 ? void 0 : tgData.user) === null || _a === void 0 ? void 0 : _a.id
        }
    });
    if (!user) {
        res.status(500).json({ message: "User not found" });
    }
    res.status(200).json({
        user_id: user === null || user === void 0 ? void 0 : user.id,
        points: user === null || user === void 0 ? void 0 : user.points,
        address: user === null || user === void 0 ? void 0 : user.address
    });
}));
router.get("/task", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("task");
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
    res.send("hii");
}));
router.post("/task", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.userId;
    // validate the inputs from the user;
    const body = req.body;
    // const body = createTaskInput.safeParse(body);
    console.log({ body });
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
}));
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
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
exports.default = router;
