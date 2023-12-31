"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../middlewares/user");
const verifyToken_1 = require("../lib/verifyToken");
const userRouter = express_1.default.Router();
exports.userRouter = userRouter;
//DELETE USER
userRouter.post("/", verifyToken_1.verify, user_1.deleteUser);
//UPDATE USER
userRouter.put("/:id", verifyToken_1.verify, user_1.updateUser);
//GET USER
userRouter.get("/:id", verifyToken_1.verify, user_1.getUser);
