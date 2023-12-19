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
                if(file) {
                    const project = await Project.findOne({ _id: projectTeam.projectId });

                    // we upload the new file
                    const fileId = randomUUID()
                    // we save the file
                    const arrayBuffer = await (file as File).arrayBuffer(); // converting blob file to bufferArray
                    const fileData = await Buffer.from(arrayBuffer); // convert arrayBuffer to buffer
                    const fileStoragePath = `${project?.createdBy}/${projectTeamId}`
                    fileURL = await storeFile(fileId, fileStoragePath, fileData)
                }

                if(fileURL) {
                    const uploadFile = new UploadedFile(
                        {
                            
                        }
                    )
                }

                const message = new Message(
                    {

                    }
                )
            }
        }
    }
    catch (err: any) {

    }
}

export async function deleteMessage(req: any, res: any) {
    try {

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