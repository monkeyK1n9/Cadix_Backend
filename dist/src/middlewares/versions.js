"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVersion = exports.getAllVersions = exports.updateVersion = exports.deleteVersion = exports.createVersion = void 0;
const crypto_1 = require("crypto");
const fileStorage_1 = require("../lib/fileStorage");
const Project_1 = require("../models/Project");
/**
 * Middleware to create a new version of a project and saving the file
 * @param req Request object
 * @param res Response object
 */
function createVersion(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // we get the userId and check if the user has authorized to create a new version
            // to be able to create a new version, you must be part of a team
            const { projectId, userId, file } = req.body;
            const project = yield Project_1.Project.findOne({
                _id: projectId,
                $or: [
                    { 'createdBy': userId },
                    { 'projectAdmins': userId },
                    { 'teams.teamMembers': userId },
                    { 'teams.groupAdmins': userId }
                ]
            });
            if (!project) {
                throw new Error("You are not authorized to create a version in this project");
            }
            else {
                // we limit not more than 10 version can be created in a project
                if (project.versions.length == 10) {
                    throw new Error("Too many versions, you can not create more than 10 versions");
                }
                const fileId = (0, crypto_1.randomUUID)();
                // we save the file
                const arrayBuffer = yield file.arrayBuffer(); // converting blob file to bufferArray
                const fileData = yield Buffer.from(arrayBuffer); // convert arrayBuffer to buffer
                const versionNumber = project.versions.length + 1;
                const fileStoragePath = `${project.createdBy}/${versionNumber}`;
                let fileURL = yield (0, fileStorage_1.storeFile)(fileId, fileStoragePath, fileData);
                // create the first project version while creating the project
                const newProjectVersion = new Project_1.ProjectVersion({
                    fileId,
                    fileURL,
                    versionNumber
                });
                const projectVersion = yield newProjectVersion.save();
                // we now update the project to include the new version
                yield Project_1.Project.findOneAndUpdate({
                    _id: projectId
                }, {
                    $push: {
                        versions: projectVersion._id
                    }
                });
                return res.status(200).json(projectVersion);
            }
        }
        catch (err) {
            return res.json({ message: "Failed to create project's new version: " + err });
        }
    });
}
exports.createVersion = createVersion;
/**
 * Middleware to delete the version of a project
 * @param req Request object
 * @param res Response object
 */
function deleteVersion(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // only users in the project can delete the version
            const { projectId, userId } = req.body;
            const projectVersionId = req.params.id;
            const project = yield Project_1.Project.findOne({
                _id: projectId,
                $or: [
                    { 'createdBy': userId },
                    { 'projectAdmins': userId },
                    { 'teams.teamMembers': userId },
                    { 'teams.groupAdmins': userId }
                ]
            });
            if (!project) {
                throw new Error("You are not authorized to create a version in this project");
            }
            else {
                // reject if it is the last remaining version of the project, only project admin can delete the project
                if (project.versions.length == 1) {
                    throw new Error("The project must have at least one version. If you can delete the last version by deleting the project.");
                }
                // delete project version
                const projectVersion = yield Project_1.ProjectVersion.findOneAndDelete({
                    _id: projectVersionId
                });
                const fileStoragePath = `${project.createdBy}/${projectVersion === null || projectVersion === void 0 ? void 0 : projectVersion.versionNumber}`;
                // delete the file in firebase storage
                yield (0, fileStorage_1.deleteFile)(fileStoragePath);
                // removing the project version from project document
                const newProject = yield Project_1.Project.findOneAndUpdate({
                    _id: projectId
                }, {
                    $pull: {
                        versions: projectVersion === null || projectVersion === void 0 ? void 0 : projectVersion._id
                    }
                }, {
                    new: true
                });
                return res.status(200).json(newProject);
            }
        }
        catch (err) {
            return res.json({ message: "Failed to delete project's version: " + err });
        }
    });
}
exports.deleteVersion = deleteVersion;
/**
 * Middleware to update a version if the user has authorization to do so.
 * @param req Request object
 * @param res Response object
 */
function updateVersion(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { projectId, userId, file } = req.body;
            const projectVersionId = req.params.id;
            // user updating must be authorized to do so
            const project = yield Project_1.Project.findOne({
                _id: projectId,
                $or: [
                    { 'createdBy': userId },
                    { 'projectAdmins': userId },
                    { 'teams.teamMembers': userId },
                    { 'teams.groupAdmins': userId }
                ]
            });
            if (!project) {
                throw new Error("You are not authorized to update a version in this project");
            }
            else {
                // updating the version is deleting the previous version, re-uploading the file and creating another, and replacing the version id in the project
                const oldProjectVersion = yield Project_1.ProjectVersion.findOneAndDelete({
                    _id: projectVersionId
                });
                const fileStoragePath = `${project.createdBy}/${oldProjectVersion === null || oldProjectVersion === void 0 ? void 0 : oldProjectVersion.versionNumber}`;
                // delete the file in firebase storage
                yield (0, fileStorage_1.deleteFile)(fileStoragePath);
                // we upload the new file
                const fileId = (0, crypto_1.randomUUID)();
                // we save the file
                const arrayBuffer = yield file.arrayBuffer(); // converting blob file to bufferArray
                const fileData = yield Buffer.from(arrayBuffer); // convert arrayBuffer to buffer
                const fileURL = yield (0, fileStorage_1.storeFile)(fileId, fileStoragePath, fileData);
                // create the first project version while creating the project
                const newProjectVersion = new Project_1.ProjectVersion({
                    fileId,
                    fileURL,
                    versionNumber: oldProjectVersion === null || oldProjectVersion === void 0 ? void 0 : oldProjectVersion.versionNumber
                });
                const projectVersion = yield newProjectVersion.save();
                //we now replace the old project version id with the new id in project
                yield Project_1.Project.updateOne({
                    _id: projectId,
                    versions: projectVersionId
                }, {
                    $set: {
                        "versions.$": projectVersion._id
                    }
                });
                return res.status(200).json(projectVersion);
            }
        }
        catch (err) {
            return res.json({ message: "Error updating project version: " + err });
        }
    });
}
exports.updateVersion = updateVersion;
/**
 * Middleware to get all the versions of a project if user is authorized.
 * @param req Request object
 * @param res Response object
 */
function getAllVersions(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { projectId, userId } = req.body;
            // user updating must be authorized to do so
            const project = yield Project_1.Project.findOne({
                _id: projectId,
                $or: [
                    { 'createdBy': userId },
                    { 'projectAdmins': userId },
                    { 'teams.teamMembers': userId },
                    { 'teams.groupAdmins': userId }
                ]
            });
            if (!project) {
                throw new Error("You are not authorized to update a version in this project");
            }
            else {
                // we send all the project versions included in the project
                const projectVersions = yield Project_1.Project.aggregate([
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
                ]);
                if (projectVersions.length == 0) {
                    throw new Error("This project has no versions");
                }
                return res.status(200).json({ projectVersions });
            }
        }
        catch (err) {
            return res.json({ message: "Failed to get all version: " + err });
        }
    });
}
exports.getAllVersions = getAllVersions;
/**
 * Middleware to get a specific version of a project if the user is authorized to see it.
 * @param req Request object
 * @param res Response object
 */
function getVersion(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId, projectId } = req.body;
            const projectVersionId = req.params.id;
            // check if user is authorized to see the project version
            const project = yield Project_1.Project.findOne({
                _id: projectId,
                $or: [
                    { 'createdBy': userId },
                    { 'projectAdmins': userId },
                    { 'teams.teamMembers': userId },
                    { 'teams.groupAdmins': userId }
                ]
            });
            if (!project) {
                throw new Error("You are not authorized to update a version in this project");
            }
            else {
                // we send the version to the user
                const projectVersion = yield Project_1.ProjectVersion.findOne({
                    _id: projectVersionId
                });
                if (!projectVersion) {
                    throw new Error("Project version not found");
                }
                else {
                    return res.status(200).json(projectVersion);
                }
            }
        }
        catch (err) {
            return res.json({ message: "Failed to get the project version: " + err });
        }
    });
}
exports.getVersion = getVersion;
