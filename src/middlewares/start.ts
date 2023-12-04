import { randomUUID } from "crypto";
import { storeFile } from "../lib/fileStorage";
import { Project, ProjectVersion } from "../models/Project";

export async function createProject(req: any, res: any) {
    try {
        const userId = req.data._id;
        const fileID = randomUUID();
        const arrayBuffer = await (req.data.file as File).arrayBuffer(); // converting blob file to bufferArray
        const fileData = await Buffer.from(arrayBuffer); // convert arrayBuffer to buffer
        const fileURL = await storeFile(userId, fileID, fileData)

        // create the first project version while creating the project
        const projectVersion = new ProjectVersion({
            fileURL,
            fileID
        })

        const newProject = new Project({
            name: req.data.projectName, //provided by user
            versions: [
                projectVersion, // first version on creation
            ],
            teams: [] // no team on creation
        })

        const project = await newProject.save();

        return res.status(200).json(project);
    }
    catch (err) {
        res.status(500).json({ message: "Error creating project", error: err})
    }
}

export async function deleteProject() {

}

export async function updateProject() {

}

export async function getAllProjects() {

}

export async function getProject() {

}

