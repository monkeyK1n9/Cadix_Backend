"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.versionsRouter = void 0;
const express_1 = __importDefault(require("express"));
const verifyToken_1 = require("../lib/verifyToken");
const versions_1 = require("../middlewares/versions");
const versionsRouter = express_1.default.Router();
exports.versionsRouter = versionsRouter;
// CREATE VERSION
versionsRouter.post("/", verifyToken_1.verify, versions_1.createVersion);
// DELETE VERSION
versionsRouter.delete("/:id", verifyToken_1.verify, versions_1.deleteVersion);
// UPDATE VERSION
versionsRouter.put("/:id", verifyToken_1.verify, versions_1.updateVersion);
// GET VERSIONS
versionsRouter.get("/", verifyToken_1.verify, versions_1.getAllVersions);
// GET VERSION
versionsRouter.get("/:id", verifyToken_1.verify, versions_1.getVersion);
