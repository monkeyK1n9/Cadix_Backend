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
exports.sendOTPVerificationEmail = exports.sendMail = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const UserOTPVerification_1 = require("../models/UserOTPVerification");
var SibApiV3Sdk = require('sib-api-v3-sdk');
var defaultClient = SibApiV3Sdk.ApiClient.instance;
dotenv_1.default.config({ path: `.env.${process.env.NODE_ENV}` });
// Configure API Key authorization with api key
var apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;
function sendMail(receiver, templateId, params) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(process.env.BREVO_API_KEY);
        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // create container to take mail options to be sent
        sendSmtpEmail = {
            to: receiver,
            templateId: templateId,
            params: params,
            headers: {
                'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2',
                'accept': 'application/json',
                'content-type': 'application/json',
            }
        };
        const data = yield apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log("Successfully sent email with data: " + data);
    });
}
exports.sendMail = sendMail;
// send OTP to user for email validation
function sendOTPVerificationEmail(user, templateId) {
    return __awaiter(this, void 0, void 0, function* () {
        // generate otp
        const otp = Math.floor((Math.random() * 9000) + 1000).toString();
        console.log(process.env.SECRET_KEY);
        // hash the otp to save in database
        const newUserOTPVerification = new UserOTPVerification_1.UserOTPVerification({
            otp: crypto_js_1.default.AES.encrypt(otp, process.env.SECRET_KEY).toString(),
            userId: user._id,
            createdAt: Date.now(),
            expiredAt: Date.now() + 3600000 // expire code in 1 hour
        });
        // store otp in database
        yield newUserOTPVerification.save();
        // send mail to user
        yield sendMail([
            {
                name: user.username,
                email: user.email
            }
        ], templateId, //templateId in Brevo
        {
            name: user.username,
            otp: otp
        });
        console.log("Successfully sent OTP verification email");
    });
}
exports.sendOTPVerificationEmail = sendOTPVerificationEmail;
