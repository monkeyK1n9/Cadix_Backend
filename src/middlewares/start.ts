import { randomUUID } from "crypto";
import { getEmptyFile, storeFile } from "../lib/fileStorage";
import { Project, ProjectTeam, ProjectVersion } from "../models/project";

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
            fileURL = await storeFile(userId, fileId, versionNumber, fileData)

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
                teams: [] // no team on creation
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
        const { projectId } = req.data;

        const project = await Project.findOne({
            _id: projectId
        })

        if (!project) {
            // if project not found, throw an error
            throw new Error("Project not found, cannot delete project.")
        }
        else {
            // we delete the related project teams, project versions, messages and all chat files associated with the project

            // 1- delete all project teams
            if (project.teams?.length >= 0) {
                for (let i = 0; i < project.teams.length; i++) {
                    await ProjectTeam.deleteOne({
                        teamId: project.teams[i]._id
                    })
                }
            }

            // 2- delete project versions and files

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

