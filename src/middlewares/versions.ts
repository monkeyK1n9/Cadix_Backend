import { randomUUID } from "crypto";
import { deleteFile, storeFile } from "../lib/fileStorage";
import { Project, ProjectTeam, ProjectVersion } from "../models/Project";
import { getStorage } from 'firebase-admin/storage';
import { Message, UploadedFile } from "../models/Message";


/**
 * Middleware to create a new version of a project and saving the file
 * @param req Request object
 * @param res Response object
 */
export async function createVersion(req: any, res: any) {
    try {
        // we get the userId and check if the user has authorized to create a new version
        // to be able to create a new version, you must be part of a team
        const { projectId, userId, file } = req.body;


        const project = await Project.findOne({
            _id: projectId,
            $or: [
                { 'projectAdmins': userId },
                { 'teams.teamMembers': userId },
                { 'teams.groupAdmins': userId }
            ]
        })

        if(!project) {
            throw new Error("You are not authorized to create a version in this project")
        }
        else {
            // we limit not more than 10 version can be created in a project
            if(project.versions.length == 10) {
                throw new Error("Too many versions, you can not create more than 10 versions")
            }

            const fileId = randomUUID()
            // we save the file
            const arrayBuffer = await (file as File).arrayBuffer(); // converting blob file to bufferArray
            const fileData = await Buffer.from(arrayBuffer); // convert arrayBuffer to buffer
            const versionNumber = project.versions.length + 1;
            const fileStoragePath = `${userId}/${versionNumber}`
            let fileURL = await storeFile(fileId, fileStoragePath, fileData)

            // create the first project version while creating the project
            const newProjectVersion = new ProjectVersion({
                fileURL,
                versionNumber
            })

            const projectVersion = await newProjectVersion.save()

            // we now update the project to include the new version
            const newProject = await Project.findOneAndUpdate(
                {
                    _id: projectId
                },
                {
                    $push: {
                        versions: projectVersion._id
                    }
                }
            )

            return res.status(200).json(newProject);
        }
        

    }
    catch (err: any) {
        return res.json({ message: "Failed to create project's new version: " + err})
    }
}

/**
 * Middleware to delete the version of a project
 * @param req Request object
 * @param res Response object
 */
export async function deleteVersion(req: any, res: any) {
    try {
        // only users in the project can delete the version
        const { projectId, userId, projectVersionId } = req.body;

        const project = await Project.findOne(
            {
                _id: projectId
            },
            {
                $or: [
                    { 'projectAdmins': userId },
                    { 'teams.teamMembers': userId },
                    { 'teams.groupAdmins': userId }
                ]
            }
        )

        if(!project) {
            throw new Error("You are not authorized to create a version in this project")
        }
        else {
            // reject if it is the last remaining version of the project, only project admin can delete the project
            if(project.versions.length == 1) {
                throw new Error("The project must have at least one version. If you can delete the last version by deleting the project.")
            }
            // delete project version
            const projectVersion = await ProjectVersion.findOneAndDelete(
                {
                    _id: projectVersionId
                }
            )

            const fileStoragePath = `${userId}/${projectVersion?.versionNumber}`
            // delete the file in firebase storage
            await deleteFile(fileStoragePath)

            // removing the project version from project document
            const newProject = await Project.findOneAndUpdate(
                {
                    _id: projectId
                },
                {
                    $pull: {
                        versions: projectVersion?._id
                    }
                }
            )

            return res.status(200).json(newProject)
        }
    }
    catch (err: any) {
        return res.json({ message: "Failed to delete project's version: " + err})
    }
}

/**
 * Middleware to update a version if the user has authorization to do so.
 * @param req Request object
 * @param res Response object
 */
export async function updateVersion(req: any, res: any) {
    try {
       
    }
    catch (err: any) {
        
    }
}

/**
 * Middleware to get all the versions of a project if user is authorized.
 * @param req Request object
 * @param res Response object
 */
export async function getAllVersions(req: any, res: any) {
    try {
      
    }
    catch (err: any) {
       
    }
}

/**
 * Middleware to get a specific version of a project if the user is authorized to see it.
 * @param req Request object
 * @param res Response object
 */
export async function getVersion(req: any, res: any) {
    try {
       
    }
    catch(err: any) {
        
    }
}

