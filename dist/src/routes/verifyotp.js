"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTPRouter = void 0;
const express_1 = __importDefault(require("express"));
const verifyotp_1 = require("../middlewares/verifyotp");
const verifyOTPRouter = express_1.default.Router();
exports.verifyOTPRouter = verifyOTPRouter;
//REGISTER
verifyOTPRouter.post("/", verifyotp_1.verifyOTP);
