"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const submission_controller_1 = require("../controllers/submission.controller");
const user_middleware_1 = require("../middlewares/user.middleware");
const taskRoute = (0, express_1.Router)();
taskRoute.post('/:taskId/submit', user_middleware_1.userMiddleware, submission_controller_1.usertaskSubmission);
exports.default = taskRoute;
