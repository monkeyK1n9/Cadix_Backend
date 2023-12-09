import { randomUUID } from "crypto";
import { getEmptyFile, storeFile } from "../lib/fileStorage";
import { Project, ProjectTeam, ProjectVersion } from "../models/project";
import {getDownloadURL, getStorage} from 'firebase-admin/storage';
import { Message, UploadedFile } from "../models/Message";


/**
 * Middleware to create a new project in database and saving the new file created
 * @param req Request object
 * @param res Response object
 */
export async function createProject(req: any, res: any) {
    try {
        const userId = req.data._id;
        const fileId = randomUUID();

        // create project if there is a file from request or download empty ifc file and provide to the user
        let fileURL: string = "";
        if (req.data.file) {
            const arrayBuffer = await (req.data.file as File).arrayBuffer(); // converting blob file to bufferArray
            const fileData = await Buffer.from(arrayBuffer); // convert arrayBuffer to buffer
            const versionNumber = 1;
            const fileStoragePath = `${fileId}/${versionNumber}`
            fileURL = await storeFile(fileId, fileStoragePath, fileData)

            // create the first project version while creating the project
            const newProjectVersion = new ProjectVersion({
                fileURL,
                versionNumber
            })

            const projectVersion = await newProjectVersion.save();

            const newProject = new Project({
                name: req.data.projectName, //provided by user
                versions: [
                    projectVersion._id, // first version on creation
                ],
                teams: [], // no team on creation
                projectAdmins: [userId], // the first project admin is the creator of the project
                createdBy: userId
            })

            const project = await newProject.save();

            return res.status(200).json(project);
        }
        else {
            // if user didn't provide a file, we reject file creation
            throw new Error("No file provided, create an IFC file and try again.")
        }

    }
    catch (err: any) {
        res.status(500).json({ message: "Error creating project: " + err.message})
    }
}

/**
 * 
 * @param req 
 * @param res 
 */
export async function deleteProject(req: any, res: any) {
    try {
        // when deleting a project, we delete the project, the related teams and all message groups
        const { projectId, userId } = req.data;

        const project = await Project.findOne({
            _id: projectId
        })

        if (!project) {
            // if project not found, throw an error
            throw new Error("Project not found, cannot delete project.")
        }
        else {
            // check if user is authorized (a projectAdmin) to delete the project
            if (!project.projectAdmins.includes(userId)) {
                throw new Error("You are not authorized to delete this project")
            }

            // we delete the related project teams, project versions, messages and all chat files associated with the project

            // 1- delete all messages and UploadFile
            if (project.teams?.length >= 0) {
                for (let i = 0; i < project.teams.length; i++) {
                    await Message.deleteMany({
                        projectTeamId: project.teams[i]
                    })
                    await UploadedFile.deleteMany({
                        projectTeamId: project.teams[i]
                    })
                }
            }
            

            // 2- delete project versions and files versions and messages attachement files
            if (project.versions?.length >= 0) {
                for (let i = 0; i < project.versions.length; i++) {
                    await ProjectVersion.deleteOne({
                        _id: project.versions[i]
                    })
                }
            }
            await getStorage().bucket(project.createdBy).delete();

            // 3- delete all project teams
            if (project.teams?.length >= 0) {
                for (let i = 0; i < project.teams.length; i++) {
                    await ProjectTeam.deleteOne({
                        _id: project.teams[i]
                    })
                }
            }

            // 4- finally delete the project
            await Project.deleteOne({
                _id: project._id
            })

            return res.status(200).json({ message: "Successfully deleted project and related files." })

        }
    }
    catch (err: any) {
        res.status(403).json({ message: "Error creating project: " + err.message})
    }
}

export async function updateProject() {

}

export async function getAllProjects() {

}

export async function getProject() {

}

