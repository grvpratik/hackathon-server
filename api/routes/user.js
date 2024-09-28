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
router.get("/test", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({ message: "success" });
}));
router.post("/list", middleware_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const taskList = yield __1.prisma.task.findMany({
        where: {
            status: client_1.TaskStatus.Active
        }
    });
    res.status(200).json(taskList);
}));
const BOT_TOKEN = '6494748312:AAHjVKXP8OC_14WB_6w6kzGWHv7kSWkL0dc'; // Consider moving to env variables
const POINTS = 200;
const sendMessage = (chatId, message) => __awaiter(void 0, void 0, void 0, function* () {
    const apiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    try {
        yield axios_1.default.post(apiUrl, {
            chat_id: chatId,
            text: message
        });
    }
    catch (error) {
        console.error('Error sending message:', error);
        throw new Error('Telegram message failed to send.');
    }
});
router.post("/:taskId/submit", middleware_1.userMiddleware, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const taskId = req.params.taskId;
    const userData = (0, middleware_1.getInitData)(res);
    const chatId = (_a = userData === null || userData === void 0 ? void 0 : userData.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!chatId) {
        return res.status(400).json({ error: 'Chat ID is required.' });
    }
    try {
        const user = yield __1.prisma.user.findFirst({
            where: { telegram_id: chatId }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        yield __1.prisma.proof.deleteMany({
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
        const submission = yield __1.prisma.proof.create({
            data: {
                telegram_id: chatId,
                userId: user.id,
                taskId: taskId,
                amount: POINTS,
            }
        });
        yield sendMessage(chatId, `Successfully created submission\nID: ${submission.id}\nPlease upload your proof.`);
        return res.status(201).json({ submissionId: submission.id });
    }
    catch (error) {
        next(error);
    }
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
