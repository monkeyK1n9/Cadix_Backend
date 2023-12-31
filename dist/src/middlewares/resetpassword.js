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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = void 0;
const User_1 = require("../models/User");
const UserOTPVerification_1 = require("../models/UserOTPVerification");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_js_1 = __importDefault(require("crypto-js"));
function resetPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId, password, confirmPassword } = req.body;
            const userOTPRecordId = req.params.id;
            // look for the userOTPRecord
            const userOTPRecord = yield UserOTPVerification_1.UserOTPVerification.findOne({
                _id: userOTPRecordId,
                userId,
            });
            if (!userOTPRecord) {
                throw new Error("You cannot reset your password, please try to resend OTP to your email address.");
            }
            else {
                if (password !== confirmPassword) {
                    throw new Error("Password and confirm password do not match.");
                }
                else {
                    // we change the password
                    const oldUser = yield User_1.User.findOne({
                        _id: userId
                    });
                    if (!oldUser) {
                        throw new Error("User not found.");
                    }
                    const newUser = yield User_1.User.updateOne({
                        _id: userId
                    }, {
                        password: crypto_js_1.default.AES.encrypt(password, process.env.SECRET_KEY).toString()
                    });
                    // we deleted the user's records
                    yield UserOTPVerification_1.UserOTPVerification.deleteMany({
                        userId
                    });
                    // create an access token and sending back to the client
                    const accessToken = jsonwebtoken_1.default.sign({
                        id: userId
                    }, process.env.SECRET_KEY, //sending the decrypting secret phrase
                    {
                        expiresIn: "90d"
                    });
                    // removing password from the data we send back to the client
                    const _a = newUser._doc, { password: newPassword } = _a, userInfo = __rest(_a, ["password"]);
                    return res.status(200).json(Object.assign({ accessToken }, userInfo));
                }
            }
        }
        catch (err) {
            return res.json({ message: "Failed to change password: " + err });
        }
    });
}
exports.resetPassword = resetPassword;
