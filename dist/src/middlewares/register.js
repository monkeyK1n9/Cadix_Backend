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
exports.registerUser = void 0;
const User_1 = require("../models/User");
const crypto_js_1 = __importDefault(require("crypto-js"));
const sendMail_1 = require("../lib/sendMail");
// const User = require('../models/User');
/**
 * Middleware for registering a user and generating an OTP to be sent by mail and validated
 * @param req request object
 * @param res response object
 */
function registerUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, username, password, confirmPassword } = req.body;
        const newUser = new User_1.User({
            username,
            email,
            password: crypto_js_1.default.AES.encrypt(password, process.env.SECRET_KEY).toString()
        });
        let user;
        try {
            // reject request if user email already exists in the database and is verified, otherwise, recreate
            const checkUser = yield User_1.User.findOne({
                email,
            });
            if (checkUser) {
                if (checkUser.isVerified) {
                    //rejecting if user already exists in the database and is verified
                    return res.status(403).json({ message: "User already exists" });
                }
                else {
                    if (password !== confirmPassword) {
                        throw new Error("Password and confirm password do not match.");
                    }
                    console.log("User already exists but not verified");
                    //if user exists and is not verified we update it
                    user = yield User_1.User.findOneAndUpdate({
                        email, // we filter user by email and update it
                    }, {
                        $set: {
                            username,
                            email,
                            password: crypto_js_1.default.AES.encrypt(password, process.env.SECRET_KEY).toString()
                        }
                    }, {
                        new: true, // we use this to return the updated document
                    });
                    // handle account email verification
                    yield (0, sendMail_1.sendOTPVerificationEmail)(user, 1);
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
            // create new user
            user = yield newUser.save();
            // handle account email verification
            yield (0, sendMail_1.sendOTPVerificationEmail)(user, 1);
            return res.status(200).json({
                status: 'PENDING',
                message: "Verification otp email sent",
                data: {
                    userId: user._id,
                    email: user.email
                }
            });
        }
        catch (err) {
            console.log("Error: ", err);
            res.status(500).json({ message: "Something went wrong. Failed to create user", error: err });
        }
    });
}
exports.registerUser = registerUser;
