import { randomUUID } from "crypto";
import { storeFile } from "../lib/fileStorage";
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
                    const fileStoragePath = `${project?.createdBy}/${projectTeamId}/messages`
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
                    await UploadedFile.deleteOne(
                        {
                            _id: message.uploadedFileId
                        }
                    )
                }
            }
            else {
                // we delete the message and eventual uploaded file

            }
        }
    }
    catch (err: any) {

    }
}

export async function updateMessage(req: any, res: any) {
    try {

    }
    catch (err: any) {

    }
}

export async function getAllMessages(req: any, res: any) {
    try {

    }
    catch (err: any) {

    }
}

export async function getMessage(req: any, res: any) {
    try {
        
    }
    catch (err: any) {
    
    }
}