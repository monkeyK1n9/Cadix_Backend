import { randomUUID } from "crypto";
import { deleteFile, storeFile } from "../lib/fileStorage";
import { Project, ProjectTeam, ProjectVersion } from "../models/Project";
import { Message, UploadedFile } from "../models/Message";


/**
 * Middleware to create a new project in database and saving the new file created
 * @param req Request object
 * @param res Response object
 */
export async function createProject(req: any, res: any) {
    try {
        const {userId, file} = req.body;
        const fileId = randomUUID();

        // create project if there is a file from request or download empty ifc file and provide to the user
        let fileURL: string = "";
        if (file) {
            const arrayBuffer = await (file as File).arrayBuffer(); // converting blob file to bufferArray
            const fileData = await Buffer.from(arrayBuffer); // convert arrayBuffer to buffer
            const versionNumber = 1;
            const fileStoragePath = `${userId}/${versionNumber}`
            fileURL = await storeFile(fileId, fileStoragePath, fileData)

            // create the first project version while creating the project
            const newProjectVersion = new ProjectVersion({
                fileURL,
                versionNumber
            })

            const projectVersion = await newProjectVersion.save();

            const newProject = new Project({
                filename: req.data.projectName, //provided by user
                description: "",
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
        res.status(500).json({ message: "Error creating project: " + err})
    }
}

/**
 * Middleware to delete recursively the project, the related teams, project versions, uploaded files in chats, and messages
 * @param req Request object
 * @param res Response object
 */
export async function deleteProject(req: any, res: any) {
    try {
        // when deleting a project, we delete the project, the related teams and all message groups
        const { userId } = req.body;
        const { projectId } = req.params;

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
            await deleteFile(project.createdBy)

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

/**
 * Middleware to update a project if the user has authorization to do so.
 * @param req Request object
 * @param res Response object
 */
export async function updateProject(req: any, res: any) {
    try {
        const { userId } = req.body;
        const { projectId } = req.params;

        const project = await Project.findOne({
            _id: projectId
        });

        // check if project exists
        if(!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // only a project admin should be allowed to update the project
        if(!project.projectAdmins?.includes(userId)) {
            throw new Error("You are not authorized to update this project.");
        }
        else {
            // we update the project
            for(const [key, value] of Object.entries(project)) {
                if(key == "createdBy") continue; // we won't update the project creator

                await Project.findOneAndUpdate(
                    {
                        _id: projectId // we filter by project Id
                    },
                    {
                        [key]: value    // we update the key value pair
                    }
                )
            }

            const newProject = await Project.findOne({
                _id: projectId
            })

            return res.status(200).json(newProject)
        }
    }
    catch (err: any) {
        return res.json({ message: "Failed to update project: " + err})
    }
}

/**
 * Middleware to get all the projects in which a user is found.
 * @param req Request object
 * @param res Response object
 */
export async function getAllProjects(req: any, res: any) {
    try {
        const { userId } = req.body;
        // we will query all the projects in which a user is found and send that back
        const projects = await Project.find({
            $or: [
                { projectAdmins: { $in: [userId] } }, // User is a project admin
                { teams: { $elemMatch: { teamMembers: { $in: [userId] } } } } // User is a member of any team associated with the project
            ]
        })

        return res.status(200).json(projects)
    }
    catch (err: any) {
        return res.json({ message: "Failed to fetch projects: " + err})
    }
}

/**
 * Middleware to get a project if the user is authorized to see it.
 * @param req Request object
 * @param res Response object
 */
export async function getProject(req: any, res: any) {
    try {
        const { userId } = req.body;
        const { projectId } = req.params

        // we fetch the project matching any possible userId included as a projectAdmin, teamMember of groupAdmin
        const project = await Project.findOne({
            _id: projectId,
            $or: [
                { 'createdBy': userId },
                { 'projectAdmins': userId },
                { 'teams.teamMembers': userId },
                { 'teams.groupAdmins': userId }
            ]
        })

        // we check if project exists 
        if(!project) {
            throw new Error("Project not found");
        }
        else {
            // we send the project to the user
            return res.status(200).json(project);
        }
    }
    catch(err: any) {
        return res.json({ message: "Failed to fetch projects: " + err})
    }
}

