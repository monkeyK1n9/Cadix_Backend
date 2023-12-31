"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessage = exports.getAllMessages = exports.updateMessage = exports.deleteMessage = exports.createMessage = void 0;
const crypto_1 = require("crypto");
const fileStorage_1 = require("../lib/fileStorage");
const Project_1 = require("../models/Project");
const Message_1 = require("../models/Message");
function createMessage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { senderId, file, projectTeamId, messageContent } = req.body;
            // we check if user is authorized to send a message to the team
            const projectTeam = yield Project_1.ProjectTeam.findOne({
                _id: projectTeamId
            });
            if (!projectTeam) {
                throw new Error("Team not found");
            }
            else {
                if (!projectTeam.teamMembers.includes(senderId)) {
                    throw new Error("You are not authorized to send a message to this team");
                }
                else {
                    // we create the message
                    let fileURL = "";
                    let fileId = "";
                    if (file) {
                        const project = yield Project_1.Project.findOne({ _id: projectTeam.projectId });
                        // we upload the new file
                        fileId = (0, crypto_1.randomUUID)();
                        // we save the file
                        const arrayBuffer = yield file.arrayBuffer(); // converting blob file to bufferArray
                        const fileData = yield Buffer.from(arrayBuffer); // convert arrayBuffer to buffer
                        const fileStoragePath = `${project === null || project === void 0 ? void 0 : project.createdBy}/${projectTeamId}`;
                        fileURL = yield (0, fileStorage_1.storeFile)(fileId, fileStoragePath, fileData);
                    }
                    let uploadedFile;
                    if (fileURL) {
                        const newUploadedFile = new Message_1.UploadedFile({
                            fileId,
                            fileURL,
                            senderId,
                            projectTeamId
                        });
                        uploadedFile = yield newUploadedFile.save();
                    }
                    const newMessage = new Message_1.Message({
                        projectTeamId,
                        senderId,
                        messageContent,
                        uploadedFileId: uploadedFile ? uploadedFile._id : ""
                    });
                    const message = yield newMessage.save();
                    return res.status(200).json(message);
                }
            }
        }
        catch (err) {
            return res.json({ message: "Failed to save message: " + err });
        }
    });
}
exports.createMessage = createMessage;
function deleteMessage(req, res) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId, senderId, projectTeamId } = req.body;
            const messageId = req.params.id;
            // check if message exists
            const message = yield Message_1.Message.findOne({
                _id: messageId
            });
            const projectTeam = yield Project_1.ProjectTeam.findOne({
                _id: projectTeamId,
                $or: [
                    { "teamMembers": userId },
                    { "groupAdmins": userId },
                ]
            });
            if (!projectTeam) {
                throw new Error("Project Team not found");
            }
            if (!message) {
                throw new Error("Message not found");
            }
            else {
                if (userId !== senderId) {
                    // then we don't permit message deletion except the userId is an admin
                    if (!((_a = projectTeam === null || projectTeam === void 0 ? void 0 : projectTeam.groupAdmins) === null || _a === void 0 ? void 0 : _a.includes(userId))) {
                        throw new Error("You are not allowed to delete this message");
                    }
                    // we delete the message and eventual uploaded file
                    if (message.uploadedFileId) {
                        const uploadedFile = yield Message_1.UploadedFile.findOneAndDelete({
                            _id: message.uploadedFileId
                        });
                        const project = yield Project_1.Project.findOne({
                            _id: projectTeam.projectId
                        });
                        const fileStoragePath = `${project === null || project === void 0 ? void 0 : project.createdBy}/${projectTeamId}`;
                        const filename = uploadedFile === null || uploadedFile === void 0 ? void 0 : uploadedFile.fileId;
                        yield (0, fileStorage_1.deleteFile)(fileStoragePath, filename);
                        yield Message_1.Message.deleteOne({
                            _id: messageId
                        });
                    }
                    else {
                        yield Message_1.Message.deleteOne({
                            _id: messageId
                        });
                    }
                }
                else {
                    // we delete the message and eventual uploaded file
                    if (message.uploadedFileId) {
                        const uploadedFile = yield Message_1.UploadedFile.findOneAndDelete({
                            _id: message.uploadedFileId
                        });
                        const project = yield Project_1.Project.findOne({
                            _id: projectTeam === null || projectTeam === void 0 ? void 0 : projectTeam.projectId
                        });
                        const fileStoragePath = `${project === null || project === void 0 ? void 0 : project.createdBy}/${projectTeamId}`;
                        const filename = uploadedFile === null || uploadedFile === void 0 ? void 0 : uploadedFile.fileId;
                        yield (0, fileStorage_1.deleteFile)(fileStoragePath, filename);
                        yield Message_1.Message.deleteOne({
                            _id: messageId
                        });
                    }
                    else {
                        yield Message_1.Message.deleteOne({
                            _id: messageId
                        });
                    }
                }
                return res.status(200).json({ message: "Successfully deleted message" });
            }
        }
        catch (err) {
            return res.json({ message: "Failed to delete message: " + err });
        }
    });
}
exports.deleteMessage = deleteMessage;
function updateMessage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId, senderId, projectTeamId, messageContent, file } = req.body;
            const messageId = req.params.id;
            // check if message exists
            const message = yield Message_1.Message.findOne({
                _id: messageId
            });
            const projectTeam = yield Project_1.ProjectTeam.findOne({
                _id: projectTeamId,
                $or: [
                    { "teamMembers": userId },
                    { "groupAdmins": userId },
                ]
            });
            if (!projectTeam) {
                throw new Error("Project Team not found");
            }
            if (!message) {
                throw new Error("Message not found");
            }
            else {
                if (userId !== senderId) {
                    throw new Error("User not authorized to update this message");
                }
                else {
                    if (!file || !messageContent)
                        throw new Error("No data to update message");
                    // we create the message
                    let fileURL = "";
                    let fileId = "";
                    if (file) {
                        const project = yield Project_1.Project.findOne({ _id: projectTeam.projectId });
                        const oldUploadedFile = yield Message_1.UploadedFile.findOne({
                            _id: message.uploadedFileId
                        });
                        // we upload the new file
                        fileId = oldUploadedFile === null || oldUploadedFile === void 0 ? void 0 : oldUploadedFile.fileId;
                        // we save the file
                        const arrayBuffer = yield file.arrayBuffer(); // converting blob file to bufferArray
                        const fileData = yield Buffer.from(arrayBuffer); // convert arrayBuffer to buffer
                        const fileStoragePath = `${project === null || project === void 0 ? void 0 : project.createdBy}/${projectTeamId}`;
                        fileURL = yield (0, fileStorage_1.storeFile)(fileId, fileStoragePath, fileData);
                    }
                    let uploadedFile;
                    if (fileURL) {
                        uploadedFile = yield Message_1.UploadedFile.findByIdAndUpdate({
                            fileId
                        }, {
                            $set: {
                                fileURL,
                            }
                        }, {
                            new: true,
                        });
                    }
                    let newMessage;
                    // we update the uploadFile if file was present
                    if (uploadedFile) {
                        newMessage = yield Message_1.Message.findOneAndUpdate({
                            _id: messageId
                        }, {
                            $set: {
                                uploadedFileId: uploadedFile._id
                            }
                        }, {
                            new: true
                        });
                    }
                    // we update messageContent
                    if (messageContent) {
                        newMessage = yield Message_1.Message.findOneAndUpdate({
                            _id: messageId
                        }, {
                            $set: {
                                messageContent
                            }
                        }, { new: true });
                    }
                    return res.status(200).json(newMessage);
                }
            }
        }
        catch (err) {
            return res.json({ message: "Failed to update message: " + err });
        }
    });
}
exports.updateMessage = updateMessage;
function getAllMessages(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId, projectTeamId } = req.body;
            // we check if the team exists and user is authorized to see the messages
            const projectTeam = yield Project_1.ProjectTeam.findOne({
                _id: projectTeamId,
                $or: [
                    { "teamMembers": userId },
                    { "groupAdmins": userId },
                ]
            });
            if (!projectTeam) {
                throw new Error("Project ");
            }
            else {
                const messages = yield Message_1.Message.find({
                    projectTeamId
                });
                return res.status(200).json({ messages });
            }
        }
        catch (err) {
            return res.json({ message: "Failed to get all messages: " + err });
        }
    });
}
exports.getAllMessages = getAllMessages;
function getMessage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId, projectTeamId } = req.body;
            const messageId = req.params.id;
            //we check if message and group exist
            const message = yield Message_1.Message.findOne({
                _id: messageId
            });
            const projectTeam = yield Project_1.ProjectTeam.findOne({
                _id: projectTeamId,
                $or: [
                    { "teamMembers": userId },
                    { "groupAdmins": userId },
                ]
            });
            if (!projectTeam) {
                throw new Error("Project Team not found");
            }
            if (!message) {
                throw new Error("Message not found");
            }
            else {
                return res.status(200).json(message);
            }
        }
        catch (err) {
            return res.json({ message: "Failed to get message: " + err });
        }
    });
}
exports.getMessage = getMessage;
