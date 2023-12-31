"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verify = (req, res, next) => {
    var _a;
    const authHeader = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.token;
    if (authHeader) {
        const token = authHeader.split(" ")[1]; //the token in the header will be of the form "Bearer sfsdgsdfsdfsfs", so the actual token will be the second entry of the array when spitted
        jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY, (err, data) => {
            if (err)
                return res.status(403).json({ msg: "Token is not valid" });
            next();
        });
    }
    else {
        return res.status(401).json({ msg: "You are not authenticated" });
    }
};
exports.verify = verify;
