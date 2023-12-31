"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRouter = void 0;
const express_1 = __importDefault(require("express"));
const start_1 = require("../middlewares/start");
const verifyToken_1 = require("../lib/verifyToken");
const startRouter = express_1.default.Router();
exports.startRouter = startRouter;
// CREATE PROJECT
startRouter.post('/', verifyToken_1.verify, start_1.createProject);
// DELETE PROJECT
startRouter.delete('/:id', verifyToken_1.verify, start_1.deleteProject);
// UPDATE PROJECT
startRouter.put('/:id', verifyToken_1.verify, start_1.updateProject);
// GET PROJECTS
startRouter.get('/', verifyToken_1.verify, start_1.getAllProjects);
// GET PROJECT
startRouter.get('/:id', verifyToken_1.verify, start_1.getProject);
