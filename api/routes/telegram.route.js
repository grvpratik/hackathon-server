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
Object.defineProperty(exports, "__esModule", { value: true });
exports.testRoute = testRoute;
const express_1 = require("express");
const create_controller_1 = require("../controllers/create.controller");
const submission_controller_1 = require("../controllers/submission.controller");
function testRoute(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
const telegramRoute = (0, express_1.Router)();
//creeate task for user via payer
telegramRoute.post('/create', create_controller_1.handleCreateRequest);
//verify the task submitted by user
telegramRoute.post('/verify', submission_controller_1.handleVerifySubmission);
exports.default = telegramRoute;
