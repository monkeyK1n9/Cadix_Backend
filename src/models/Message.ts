import { randomUUID } from "crypto";
import mongoose from "mongoose";

// handle if user send message with attachements
const uploadedFileSchema = new mongoose.Schema({
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProjectTeam',
        required: true,
    },
}, {
    timestamps: true
});

export const UploadedFile = mongoose.model('UploadedFile', uploadedFileSchema);

// handle the message groups
const messageSchema = new mongoose.Schema({
    projectTeamId: {
        type: mongoose.Schema.Types.ObjectId,
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UploadedFile',
    },

}, {
    timestamps: true
});

export const Message = mongoose.model('Message', messageSchema);