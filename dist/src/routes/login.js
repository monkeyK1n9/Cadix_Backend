"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginRouter = void 0;
const express_1 = __importDefault(require("express"));
const login_1 = require("../middlewares/login");
const loginRouter = express_1.default.Router();
exports.loginRouter = loginRouter;
//LOGIN
loginRouter.post("/", login_1.loginUser);
