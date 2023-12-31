"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPasswordRouter = void 0;
const express_1 = __importDefault(require("express"));
const forgotpassword_1 = require("../middlewares/forgotpassword");
const forgotPasswordRouter = express_1.default.Router();
exports.forgotPasswordRouter = forgotPasswordRouter;
//REQUEST PASSWORD RESET WITH OTP
forgotPasswordRouter.post("/", forgotpassword_1.sendResetOTP);
