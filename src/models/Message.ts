import { randomUUID } from "crypto";
import mongoose from "mongoose";

// handle if user send message with attachements
const uploadedFileSchema = new mongoose.Schema({
    fileURL: {
        type: String, // linked to file stored in storage (firebase)
        required: true,
    },
    senderId: {
        type: String, // user ID
        required: true,
    },
    fileType: {
        type: String,
        default: "",
        enum: ['image', 'video', 'other'], // TODO: modify the filetype
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
    attachments: [
        {
            fileId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'UploadedFile',
            },
            fileType: {
                type: String,
                enum: ['image', 'video', 'other'],
            },
        },
    ]
}, {
    timestamps: true
});

export const Message = mongoose.model('Message', messageSchema);