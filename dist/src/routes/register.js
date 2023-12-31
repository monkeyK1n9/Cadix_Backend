"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRouter = void 0;
const express_1 = __importDefault(require("express"));
const register_1 = require("../middlewares/register");
const registerRouter = express_1.default.Router();
exports.registerRouter = registerRouter;
//REGISTER
registerRouter.post("/", register_1.registerUser);
