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
exports.resetAccountOTP = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const UserOTPVerification_1 = require("../models/UserOTPVerification");
// const User = require('../models/User');
/**
 * Middleware to verify the otp the user received by mail and resetting the password
 * @param req request object
 * @param res response object
 */
function resetAccountOTP(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId, otp } = req.body;
            if (!userId || !otp) {
                throw new Error("Empty otp defails are not allowed");
            }
            const userOTPVerificationRecords = yield UserOTPVerification_1.UserOTPVerification
                .find({
                userId
            })
                .sort({
                createdAt: -1 //sort in descending order. Newest first.
            });
            // check if the user has otp recodrd in database
            if (userOTPVerificationRecords.length <= 0) {
                // we tell the user he has no otp record and needs to sign up
                throw new Error("Account record does not exist or has been verified already. Please sign up or log in");
            }
            else {
                // user otp record exists
                const userOTPRecord = userOTPVerificationRecords[0];
                const encryptedOTP = userOTPVerificationRecords[0].otp;
                // check if the otp is still valid after the time passed ( we allowed 60 mins)
                if (userOTPRecord.expiredAt.getTime() < new Date().getTime()) {
                    // the otp has expired, we delete all user's records
                    yield UserOTPVerification_1.UserOTPVerification.deleteMany({
                        userId
                    });
                    // we throw error to alert about code expiration
                    throw new Error("Code has expired. Please request again.");
                }
                else {
                    // if time validity is correct, we compare the receive OTP and the one in the database
                    const decryptedOTP = crypto_js_1.default.AES.decrypt(encryptedOTP, process.env.SECRET_KEY).toString(crypto_js_1.default.enc.Utf8);
                    if (otp != decryptedOTP) {
                        // supplied code is invalid
                        throw new Error("Invalid code passed. Check your inbox.");
                    }
                    else {
                        // correct otp, we redirect user to reset password with the specified otp record id
                        return res.redirect(`/api/v1/resetpassword/${userOTPRecord._id}`);
                    }
                }
            }
        }
        catch (err) {
            return res.json({
                status: "FAILED",
                message: err.message
            });
        }
    });
}
exports.resetAccountOTP = resetAccountOTP;
