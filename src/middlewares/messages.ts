import { randomUUID } from "crypto";
import { deleteFile, storeFile } from "../lib/fileStorage";
import { Project, ProjectTeam } from "../models/Project";
import { Message, UploadedFile } from "../models/Message";


export async function createMessage(req: any, res: any) {
    try {
        const { senderId, file, projectTeamId, messageContent } = req.body;

        // we check if user is authorized to send a message to the team
        const projectTeam = await ProjectTeam.findOne(
            {
                _id: projectTeamId
            }
        )

        if(!projectTeam) {
            throw new Error("Team not found");
        }
        else {
            if(!projectTeam.teamMembers.includes(senderId)) {
                throw new Error("You are not authorized to send a message to this team");
            }
            else {
                // we create the message
                let fileURL = "";
                let fileId = "";
                if(file) {
                    const project = await Project.findOne({ _id: projectTeam.projectId });

                    // we upload the new file
                    fileId = randomUUID()
                    // we save the file
                    const arrayBuffer = await (file as File).arrayBuffer(); // converting blob file to bufferArray
                    const fileData = await Buffer.from(arrayBuffer); // convert arrayBuffer to buffer
                    const fileStoragePath = `${project?.createdBy}/${projectTeamId}`
                    fileURL = await storeFile(fileId, fileStoragePath, fileData)
                }

                let uploadedFile;

                if(fileURL) {
                    const newUploadedFile = new UploadedFile(
                        {
                            fileId,
                            fileURL,
                            senderId,
                            projectTeamId
                        }
                    )

                    uploadedFile = await newUploadedFile.save();
                }

                const newMessage = new Message(
                    {
                        projectTeamId,
                        senderId,
                        messageContent,
                        uploadedFileId: uploadedFile ? uploadedFile._id : ""
                    }
                )

                const message = await newMessage.save();

                return res.status(200).json(message);
            }
        }
    }
    catch (err: any) {
        return res.json({ message: "Failed to save message: " + err });
    }
}

export async function deleteMessage(req: any, res: any) {
    try {
        const { userId, senderId, projectTeamId } = req.body;
        const messageId = req.params.id;

        // check if message exists
        const message = await Message.findOne(
            {
                _id: messageId
            }
        )

        const projectTeam = await ProjectTeam.findOne(
            {
                _id: projectTeamId,
                $or: [
                    { "teamMembers": userId },
                    { "groupAdmins": userId },
                ]
            }
        )

        if(!projectTeam) {
            throw new Error("Project Team not found");
        }

        if(!message) {
            throw new Error("Message not found");
        }
        else {
            if(userId !== senderId) {
                // then we don't permit message deletion except the userId is an admin
                if(!projectTeam?.groupAdmins?.includes(userId)) {
                    throw new Error("You are not allowed to delete this message");
                }

                // we delete the message and eventual uploaded file
                if(message.uploadedFileId) {
                    const uploadedFile = await UploadedFile.findOneAndDelete(
                        {
                            _id: message.uploadedFileId
                        }
                    )

                    const project = await Project.findOne(
                        {
                            _id: projectTeam.projectId
                        }
                    )

                    const fileStoragePath = `${project?.createdBy}/${projectTeamId}`;
                    const filename = uploadedFile?.fileId as string;

                    await deleteFile(fileStoragePath, filename)

                    await Message.deleteOne(
                        {
                            _id: messageId
                        }
                    )
                }
                else {
                    await Message.deleteOne(
                        {
                            _id: messageId
                        }
                    )
                }

            }
            else {
                // we delete the message and eventual uploaded file
                if(message.uploadedFileId) {
                    const uploadedFile = await UploadedFile.findOneAndDelete(
                        {
                            _id: message.uploadedFileId
                        }
                    )

                    const project = await Project.findOne(
                        {
                            _id: projectTeam?.projectId
                        }
                    )

                    const fileStoragePath = `${project?.createdBy}/${projectTeamId}`;
                    const filename = uploadedFile?.fileId as string;

                    await deleteFile(fileStoragePath, filename)

                    await Message.deleteOne(
                        {
                            _id: messageId
                        }
                    )
                }
                else {
                    await Message.deleteOne(
                        {
                            _id: messageId
                        }
                    )
                }

            }
            return res.status(200).json({ message: "Successfully deleted message" });
        }
    }
    catch (err: any) {
        return res.json({ message: "Failed to delete message: " + err });
    }
}

export async function updateMessage(req: any, res: any) {
    try {
        const { userId, senderId, projectTeamId, messageContent, file } = req.body;
        const messageId = req.params.id;

        // check if message exists
        const message = await Message.findOne(
            {
                _id: messageId
            }
        )

        const projectTeam = await ProjectTeam.findOne(
            {
                _id: projectTeamId,
                $or: [
                    { "teamMembers": userId },
                    { "groupAdmins": userId },
                ]
            }
        )

        if(!projectTeam) {
            throw new Error("Project Team not found");
        }

        if(!message) {
            throw new Error("Message not found");
        }
        else {
            if(userId !== senderId) {
                throw new Error("User not authorized to update this message");
            }
            else {
                if(!file || !messageContent) throw new Error("No data to update message");

                // we create the message
                let fileURL = "";
                let fileId = "";
                if(file) {
                    const project = await Project.findOne({ _id: projectTeam.projectId });
                    
                    const oldUploadedFile = await UploadedFile.findOne(
                        {
                            _id: message.uploadedFileId
                        }
                    );
                    // we upload the new file
                    fileId = oldUploadedFile?.fileId as string;
                    // we save the file
                    const arrayBuffer = await (file as File).arrayBuffer(); // converting blob file to bufferArray
                    const fileData = await Buffer.from(arrayBuffer); // convert arrayBuffer to buffer
                    const fileStoragePath = `${project?.createdBy}/${projectTeamId}`
                    fileURL = await storeFile(fileId, fileStoragePath, fileData)
                }

                let uploadedFile;

                if(fileURL) {
                    uploadedFile = await UploadedFile.findByIdAndUpdate(
                        {
                            fileId
                        },
                        {
                            $set: {
                                fileURL,
                            }
                        },
                        {
                            new: true,
                        }
                    )
                }

                let newMessage;
                // we update the uploadFile if file was present
                if(uploadedFile) {
                    newMessage = await Message.findOneAndUpdate(
                        {
                            _id: messageId
                        },
                        {
                            $set: {
                                uploadedFileId: uploadedFile._id
                            }
                        },
                        {
                            new: true
                        }
                    )
                }
                
                // we update messageContent
                if(messageContent) {
                    newMessage = await Message.findOneAndUpdate(
                        {
                            _id: messageId
                        },
                        {
                            $set: {
                                messageContent
                            }
                        },
                        { new: true }
                    )
                }

                return res.status(200).json(newMessage);
            }
        }
    }
    catch (err: any) {
        return res.json({ message: "Failed to update message: " + err });
    }
}

export async function getAllMessages(req: any, res: any) {
    try {
        const { userId, projectTeamId } = req.body;

        // we check if the team exists and user is authorized to see the messages
        const projectTeam = await ProjectTeam.findOne(
            {
                _id: projectTeamId,
                $or: [
                    { "teamMembers": userId },
                    { "groupAdmins": userId },
                ]
            }
        );

        if(!projectTeam) {
            throw new Error("Project ")
        }
        else {
            const messages = await Message.find(
                {
                    projectTeamId
                }
            )

            return res.status(200).json({ messages });
        }
    }
    catch (err: any) {
        return res.json({ message: "Failed to get all messages: " + err });
    }
}

export async function getMessage(req: any, res: any) {
    try {
        const { userId, projectTeamId } = req.body;
        const messageId = req.params.id;

        //we check if message and group exist
        const message = await Message.findOne(
            {
                _id: messageId
            }
        )

        const projectTeam = await ProjectTeam.findOne(
            {
                _id: projectTeamId,
                $or: [
                    { "teamMembers": userId },
                    { "groupAdmins": userId },
                ]
            }
        )

        if(!projectTeam) {
            throw new Error("Project Team not found");
        }

        if(!message) {
            throw new Error("Message not found");
        }
        else {
            return res.status(200).json(message);
        }
    }
    catch (err: any) {
        return res.json({ message: "Failed to get message: " + err });
    }
}