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
exports.sendResetOTP = void 0;
const sendMail_1 = require("../lib/sendMail");
const User_1 = require("../models/User");
function sendResetOTP(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email } = req.body;
            // we look for a user with this email
            const user = yield User_1.User.findOne({ email });
            if (!user) {
                throw new Error("User with this email not found");
            }
            else {
                if (!user.isVerified) {
                    throw new Error("Account not verified, register a new account with your email.");
                }
                else {
                    // handle account email verification
                    yield (0, sendMail_1.sendOTPVerificationEmail)(user, 2);
                    return res.status(200).json({
                        status: 'PENDING',
                        message: "Verification otp email sent",
                        data: {
                            userId: user._id,
                            email: user.email
                        }
                    });
                }
            }
        }
        catch (err) {
            return res.json({ message: "Something went wrong: " + err });
        }
    });
}
exports.sendResetOTP = sendResetOTP;
