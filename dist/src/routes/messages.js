"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagesRouter = void 0;
const express_1 = __importDefault(require("express"));
const messages_1 = require("../middlewares/messages");
const verifyToken_1 = require("../lib/verifyToken");
const messagesRouter = express_1.default.Router();
exports.messagesRouter = messagesRouter;
// CREATE MESSAGE
messagesRouter.post('/', verifyToken_1.verify, messages_1.createMessage);
// DELETE MESSAGE
messagesRouter.delete('/:id', verifyToken_1.verify, messages_1.deleteMessage);
// UPDATE MESSAGE
messagesRouter.put('/:id', verifyToken_1.verify, messages_1.updateMessage);
// GET MESSAGES
messagesRouter.get('/', verifyToken_1.verify, messages_1.getAllMessages);
// GET MESSAGE
messagesRouter.get('/:id', verifyToken_1.verify, messages_1.getMessage);
