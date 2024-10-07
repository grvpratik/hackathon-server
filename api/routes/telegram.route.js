"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const create_controller_1 = require("../controllers/create.controller");
const submission_controller_1 = require("../controllers/submission.controller");
const telegramRoute = (0, express_1.Router)();
//creeate task for user via payer
telegramRoute.post('/create', create_controller_1.handleCreateRequest);
//verify the task submitted by user
telegramRoute.post('/verify', submission_controller_1.handleVerifySubmission);
exports.default = telegramRoute;
