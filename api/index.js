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
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_1 = __importDefault(require("./routes/user"));
const payer_1 = __importDefault(require("./routes/payer"));
const client_1 = require("@prisma/client");
const middleware_1 = require("./middleware");
const tasks_1 = __importDefault(require("./routes/tasks"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
exports.prisma = new client_1.PrismaClient();
exports.prisma.$connect().then(() => {
    console.log('Connected to database');
}).catch((err) => {
    console.error('Failed to connect to database', err);
    process.exit(1);
});
app.use("/v1/tasks", tasks_1.default);
app.use("/v1/user", user_1.default);
app.use("/v1/payer", payer_1.default);
app.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).send("get request here");
    }
    catch (error) {
        next(error);
    }
}));
// This should be after all routes
app.use(middleware_1.defaultErrorMiddleware);
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.prisma.$disconnect();
    process.exit();
}));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server 💽 listening on PORT ${PORT}`);
});
exports.default = app;
