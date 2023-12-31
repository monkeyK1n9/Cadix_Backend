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
exports.loginUser = void 0;
const User_1 = require("../models/User");
const crypto_js_1 = __importDefault(require("crypto-js"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// const User = require('../models/User');
/**
 * Middleware for logging a user with email and password
 * @param req request object
 * @param res response object
 */
function loginUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield User_1.User.findOne({
                email: req.body.email
            });
            if (!user) {
                return res.status(401).json({ message: "Wrong email or password" });
            }
            // decrypt the password
            const decryptedPassword = crypto_js_1.default.AES.decrypt(user.password, process.env.SECRET_KEY).toString(crypto_js_1.default.enc.Utf8);
            // check for invalid password
            if (decryptedPassword !== req.body.password) {
                return res.status(401).json({ message: "Wrong email or password" });
            }
            // create an access token and sending back to the client
            const accessToken = jsonwebtoken_1.default.sign({
                id: user._id
            }, process.env.SECRET_KEY, //sending the decrypting secret phrase
            {
                expiresIn: "90d"
            });
            // removing password from the data we send back to the client
            const _a = user._doc, { password } = _a, userInfo = __rest(_a, ["password"]);
            return res.status(200).json(Object.assign({ accessToken }, userInfo));
        }
        catch (err) {
            return res.status(500).json({ message: "Failed to login user", error: err });
        }
    });
}
exports.loginUser = loginUser;
