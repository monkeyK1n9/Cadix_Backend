"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = exports.UploadedFile = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// handle if user send message with attachements
const uploadedFileSchema = new mongoose_1.default.Schema({
    fileId: {
        type: String, // a generated random string to name the file. this is not the id of the uploaded file.
    },
    fileURL: {
        type: String, // linked to file stored in storage (firebase)
        required: true,
    },
    senderId: {
        type: String, // user ID
        required: true,
    },
    projectTeamId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'ProjectTeam',
        required: true,
    },
}, {
    timestamps: true
});
exports.UploadedFile = mongoose_1.default.model('UploadedFile', uploadedFileSchema);
// handle the message groups
const messageSchema = new mongoose_1.default.Schema({
    projectTeamId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'ProjectTeam',
        required: true,
    },
    senderId: {
        type: String, // User ID
        required: true,
    },
    messageContent: {
        type: String,
    },
    uploadedFileId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'UploadedFile',
    },
}, {
    timestamps: true
});
exports.Message = mongoose_1.default.model('Message', messageSchema);
