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
exports.getProject = exports.getAllProjects = exports.updateProject = exports.deleteProject = exports.createProject = void 0;
const crypto_1 = require("crypto");
const fileStorage_1 = require("../lib/fileStorage");
const Project_1 = require("../models/Project");
const Message_1 = require("../models/Message");
/**
 * Middleware to create a new project in database and saving the new file created
 * @param req Request object
 * @param res Response object
 */
function createProject(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId, file } = req.body;
            const fileId = (0, crypto_1.randomUUID)();
            // create project if there is a file from request or download empty ifc file and provide to the user
            let fileURL = "";
            if (file) {
                const arrayBuffer = yield file.arrayBuffer(); // converting blob file to bufferArray
                const fileData = yield Buffer.from(arrayBuffer); // convert arrayBuffer to buffer
                const versionNumber = 1;
                const fileStoragePath = `${userId}/${versionNumber}`;
                fileURL = yield (0, fileStorage_1.storeFile)(fileId, fileStoragePath, fileData);
                // create the first project version while creating the project
                const newProjectVersion = new Project_1.ProjectVersion({
                    fileURL,
                    versionNumber
                });
                const projectVersion = yield newProjectVersion.save();
                const newProject = new Project_1.Project({
                    projectName: req.data.projectName, //provided by user
                    description: "",
                    versions: [
                        projectVersion._id, // first version on creation
                    ],
                    teams: [], // no team on creation
                    projectAdmins: [userId], // the first project admin is the creator of the project
                    createdBy: userId
                });
                const project = yield newProject.save();
                return res.status(200).json(project);
            }
            else {
                // if user didn't provide a file, we reject file creation
                throw new Error("No file provided, create an IFC file and try again.");
            }
        }
        catch (err) {
            res.status(500).json({ message: "Error creating project: " + err });
        }
    });
}
exports.createProject = createProject;
/**
 * Middleware to delete recursively the project, the related teams, project versions, uploaded files in chats, and messages
 * @param req Request object
 * @param res Response object
 */
function deleteProject(req, res) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // when deleting a project, we delete the project, the related teams and all message groups
            const { userId } = req.body;
            const projectId = req.params.id;
            const project = yield Project_1.Project.findOne({
                _id: projectId
            });
            if (!project) {
                // if project not found, throw an error
                throw new Error("Project not found, cannot delete project.");
            }
            else {
                // check if user is authorized (a projectAdmin) to delete the project
                if (!project.projectAdmins.includes(userId) || project.createdBy !== userId) {
                    throw new Error("You are not authorized to delete this project");
                }
                // we delete the related project teams, project versions, messages and all chat files associated with the project
                // 1- delete all messages and UploadFile
                if (((_a = project.teams) === null || _a === void 0 ? void 0 : _a.length) >= 0) {
                    for (let i = 0; i < project.teams.length; i++) {
                        yield Message_1.Message.deleteMany({
                            projectTeamId: project.teams[i]
                        });
                        yield Message_1.UploadedFile.deleteMany({
                            projectTeamId: project.teams[i]
                        });
                    }
                }
                // 2- delete project versions and files versions and messages attachement files
                if (((_b = project.versions) === null || _b === void 0 ? void 0 : _b.length) >= 0) {
                    for (let i = 0; i < project.versions.length; i++) {
                        yield Project_1.ProjectVersion.deleteOne({
                            _id: project.versions[i]
                        });
                    }
                }
                yield (0, fileStorage_1.deleteFile)(project.createdBy);
                // 3- delete all project teams
                if (((_c = project.teams) === null || _c === void 0 ? void 0 : _c.length) >= 0) {
                    for (let i = 0; i < project.teams.length; i++) {
                        yield Project_1.ProjectTeam.deleteOne({
                            _id: project.teams[i]
                        });
                    }
                }
                // 4- finally delete the project
                yield Project_1.Project.deleteOne({
                    _id: project._id
                });
                return res.status(200).json({ message: "Successfully deleted project and related files." });
            }
        }
        catch (err) {
            res.status(403).json({ message: "Error creating project: " + err.message });
        }
    });
}
exports.deleteProject = deleteProject;
/**
 * Middleware to update a project if the user has authorization to do so.
 * @param req Request object
 * @param res Response object
 */
function updateProject(req, res) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId, projectName, description } = req.body;
            const projectId = req.params.id;
            const project = { projectName, description };
            const oldProject = yield Project_1.Project.findOne({
                _id: projectId
            });
            // check if project exists
            if (!oldProject) {
                return res.status(404).json({ message: "Project not found" });
            }
            // only a project admin should be allowed to update the project
            if (!((_a = oldProject.projectAdmins) === null || _a === void 0 ? void 0 : _a.includes(userId))) {
                throw new Error("You are not authorized to update this project.");
            }
            else {
                // we update the project
                for (const [key, value] of Object.entries(project)) {
                    if (key == "createdBy")
                        continue; // we won't update the project creator
                    if (key && value) {
                        yield Project_1.Project.findOneAndUpdate({
                            _id: projectId // we filter by project Id
                        }, {
                            $set: {
                                [key]: value // we update the key value pair
                            }
                        });
                    }
                }
                const newProject = yield Project_1.Project.findOne({
                    _id: projectId
                });
                return res.status(200).json(newProject);
            }
        }
        catch (err) {
            return res.json({ message: "Failed to update project: " + err });
        }
    });
}
exports.updateProject = updateProject;
/**
 * Middleware to get all the projects in which a user is found.
 * @param req Request object
 * @param res Response object
 */
function getAllProjects(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId } = req.body;
            // we will query all the projects in which a user is found and send that back
            const projects = yield Project_1.Project.find({
                $or: [
                    { projectAdmins: { $in: [userId] } }, // User is a project admin
                    { teams: { $elemMatch: { teamMembers: { $in: [userId] } } } } // User is a member of any team associated with the project
                ]
            });
            return res.status(200).json(projects);
        }
        catch (err) {
            return res.json({ message: "Failed to fetch projects: " + err });
        }
    });
}
exports.getAllProjects = getAllProjects;
/**
 * Middleware to get a project if the user is authorized to see it.
 * @param req Request object
 * @param res Response object
 */
function getProject(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId } = req.body;
            const projectId = req.params.id;
            // we fetch the project matching any possible userId included as a projectAdmin, teamMember of groupAdmin
            const project = yield Project_1.Project.findOne({
                _id: projectId,
                $or: [
                    { 'createdBy': userId },
                    { 'projectAdmins': userId },
                    { 'teams.teamMembers': userId },
                    { 'teams.groupAdmins': userId }
                ]
            });
            // we check if project exists 
            if (!project) {
                throw new Error("Project not found");
            }
            else {
                // we send the project to the user
                return res.status(200).json(project);
            }
        }
        catch (err) {
            return res.json({ message: "Failed to fetch projects: " + err });
        }
    });
}
exports.getProject = getProject;
