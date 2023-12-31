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
                { 'createdBy': userId },
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
            const fileStoragePath = `${project.createdBy}/${versionNumber}`
            let fileURL = await storeFile(fileId, fileStoragePath, fileData)

            // create the first project version while creating the project
            const newProjectVersion = new ProjectVersion({
                fileId,
                fileURL,
                versionNumber
            })

            const projectVersion = await newProjectVersion.save()

            // we now update the project to include the new version
            await Project.findOneAndUpdate(
                {
                    _id: projectId
                },
                {
                    $push: {
                        versions: projectVersion._id
                    }
                }
            )

            return res.status(200).json(projectVersion);
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
        const { projectId, userId } = req.body;
        const projectVersionId = req.params.id;

        const project = await Project.findOne(
            {
                _id: projectId,
                $or: [
                    { 'createdBy': userId },
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

            const fileStoragePath = `${project.createdBy}/${projectVersion?.versionNumber}`
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
                },
                {
                    new: true
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
        const { projectId, userId, file } = req.body;
        const projectVersionId = req.params.id;

        // user updating must be authorized to do so
        const project = await Project.findOne(
            {
                _id: projectId,
                $or: [
                    { 'createdBy': userId },
                    { 'projectAdmins': userId },
                    { 'teams.teamMembers': userId },
                    { 'teams.groupAdmins': userId }
                ]
            }
        )

        if(!project) {
            throw new Error("You are not authorized to update a version in this project")
        }
        else {
            // updating the version is deleting the previous version, re-uploading the file and creating another, and replacing the version id in the project
            const oldProjectVersion = await ProjectVersion.findOneAndDelete(
                {
                    _id: projectVersionId
                }
            )
            const fileStoragePath = `${project.createdBy}/${oldProjectVersion?.versionNumber}`
            // delete the file in firebase storage
            await deleteFile(fileStoragePath)

            // we upload the new file
            const fileId = randomUUID()
            // we save the file
            const arrayBuffer = await (file as File).arrayBuffer(); // converting blob file to bufferArray
            const fileData = await Buffer.from(arrayBuffer); // convert arrayBuffer to buffer
            const fileURL = await storeFile(fileId, fileStoragePath, fileData)

            // create the first project version while creating the project
            const newProjectVersion = new ProjectVersion({
                fileId,
                fileURL,
                versionNumber: oldProjectVersion?.versionNumber
            })

            const projectVersion = await newProjectVersion.save()

            //we now replace the old project version id with the new id in project
            await Project.updateOne(
                {
                    _id: projectId,
                    versions: projectVersionId
                },
                {
                    $set: {
                        "versions.$": projectVersion._id
                    }
                }
            )

            return res.status(200).json(projectVersion)
        }
    }
    catch (err: any) {
        return res.json({ message: "Error updating project version: " + err })
    }
}

/**
 * Middleware to get all the versions of a project if user is authorized.
 * @param req Request object
 * @param res Response object
 */
export async function getAllVersions(req: any, res: any) {
    try {
        const { projectId, userId } = req.body;

        // user updating must be authorized to do so
        const project = await Project.findOne(
            {
                _id: projectId,
                $or: [
                    { 'createdBy': userId },
                    { 'projectAdmins': userId },
                    { 'teams.teamMembers': userId },
                    { 'teams.groupAdmins': userId }
                ]
            }
        )

        if(!project) {
            throw new Error("You are not authorized to update a version in this project")
        }
        else {
            // we send all the project versions included in the project
            const projectVersions = await Project.aggregate([
                { $match: { _id: projectId } },
                {
                    $unwind: "$versions",
                },
                {
                $lookup: {
                    from: "ProjectVersion", // Name of the ProjectVersion collection
                    localField: "versions",
                    foreignField: "_id",
                    as: "projectVersion", //given name to the result
                },
                },
                {
                    $unwind: "$projectVersion",
                },
                {
                    $project: {
                        _id: "$projectVersion._id",
                        fileURL: "$projectVersion.fileURL",
                        versionNumber: "$projectVersion.versionNumber",
                        createdAt: "$projectVersion.createdAt",
                        updatedAt: "$projectVersion.updatedAt"
                    },
                },
            ])

            if (projectVersions.length == 0) {
                throw new Error("This project has no versions")
            }

            return res.status(200).json({ projectVersions })
        }      
    }
    catch (err: any) {
        return res.json({ message: "Failed to get all version: " + err })
    }
}

/**
 * Middleware to get a specific version of a project if the user is authorized to see it.
 * @param req Request object
 * @param res Response object
 */
export async function getVersion(req: any, res: any) {
    try {
        const { userId, projectId } = req.body;
        const projectVersionId = req.params.id;

        // check if user is authorized to see the project version
        const project = await Project.findOne(
            {
                _id: projectId,
                $or: [
                    { 'createdBy': userId },
                    { 'projectAdmins': userId },
                    { 'teams.teamMembers': userId },
                    { 'teams.groupAdmins': userId }
                ]
            }
        )

        if(!project) {
            throw new Error("You are not authorized to update a version in this project")
        }
        else {
            // we send the version to the user
            const projectVersion = await ProjectVersion.findOne(
                {
                    _id: projectVersionId
                }
            );

            if (!projectVersion) {
                throw new Error("Project version not found")
            }
            else {
                return res.status(200).json(projectVersion);
            }
        }
    }
    catch(err: any) {
        return res.json({ message: "Failed to get the project version: " + err })
    }
}

