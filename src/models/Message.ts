import { randomUUID } from "crypto";
import mongoose from "mongoose";

// handle if user send message with attachements
const uploadedFileSchema = new mongoose.Schema({
    fileId: {
        type: mongoose.Schema.Types.UUID,
        default: () => randomUUID(),
        required: true,
        unique: true,
    },
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
        required: true,
        enum: ['image', 'video', 'other'], // TODO: modify the filetype
    }  
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
                type: mongoose.Schema.Types.UUID,
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