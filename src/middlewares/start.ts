import { randomUUID } from "crypto";
import { storeFile } from "../lib/fileStorage";
import { Project, ProjectVersion } from "../models/Project";

export async function createProject(req: any, res: any) {
    try {
        const userId = req.data._id;
        const fileID = randomUUID();

        // create project if there is a file from request or download empty ifc file and provide to the user
        let fileURL;
        if (req.data.file) {
            const arrayBuffer = await (req.data.file as File).arrayBuffer(); // converting blob file to bufferArray
            const fileData = await Buffer.from(arrayBuffer); // convert arrayBuffer to buffer
            fileURL = await storeFile(userId, fileID, fileData)
        }
        else {

        }

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
    try {
        // when deleting a project, we delete the project, the related teams and all message groups
    }
    catch (err) {

    }
}

export async function updateProject() {

}

export async function getAllProjects() {

}

export async function getProject() {

}

