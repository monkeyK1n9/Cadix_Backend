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
exports.joinTeam = exports.inviteMember = exports.getTeam = exports.getAllTeams = exports.updateTeam = exports.deleteTeam = exports.createTeam = void 0;
const fileStorage_1 = require("../lib/fileStorage");
const InvitationLink_1 = require("../models/InvitationLink");
const Message_1 = require("../models/Message");
const Project_1 = require("../models/Project");
function createTeam(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId, projectId, groupAdmins, teamMembers } = req.body;
            // user can only create a team if he is a project admin or project owner
            const project = yield Project_1.Project.findOne({
                _id: projectId
            });
            if (!project) {
                throw new Error("Project not found");
            }
            else {
                if (!project.projectAdmins.includes(userId) || project.createdBy != userId) {
                    throw new Error("User is not authorized to create a team");
                }
                else {
                    // we create the team
                    const newProjectTeam = new Project_1.ProjectTeam({
                        projectId,
                        groupAdmins,
                        teamMembers
                    });
                    const projectTeam = yield newProjectTeam.save();
                    //add the team to the project
                    yield Project_1.Project.findOneAndUpdate({
                        _id: projectId
                    }, {
                        $push: {
                            teams: projectTeam._id
                        }
                    });
                    return res.status(200).json(projectTeam);
                }
            }
        }
        catch (err) {
            return res.json({ message: "Failed to create team: " + err });
        }
    });
}
exports.createTeam = createTeam;
function deleteTeam(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId, projectId } = req.body;
            const projectTeamId = req.params.id;
            //we check if the team exists
            let projectTeam = yield Project_1.ProjectTeam.findOne({ _id: projectTeamId });
            if (!projectTeam) {
                throw new Error("Project team not found");
            }
            else {
                // we obtain the project
                let project = yield Project_1.Project.findOne({
                    _id: projectId,
                    $or: [
                        { 'createdBy': userId },
                        { 'projectAdmins': userId },
                    ]
                });
                if (!project) {
                    throw new Error("Project not found or you are not allowed to delete project team");
                }
                else {
                    if (!project.teams.includes(projectTeamId)) {
                        throw new Error("Team not included in the project.");
                    }
                    // we remove the team from the project
                    projectTeam = yield Project_1.ProjectTeam.findOneAndDelete({ _id: projectTeamId });
                    project = yield Project_1.Project.findOneAndUpdate({ _id: projectId }, {
                        $pull: {
                            teams: projectTeam === null || projectTeam === void 0 ? void 0 : projectTeam._id
                        }
                    }, {
                        new: true
                    });
                    //delete all messages and files of team
                    yield Message_1.Message.deleteMany({
                        projectTeamId: projectTeam === null || projectTeam === void 0 ? void 0 : projectTeam._id
                    });
                    yield Message_1.UploadedFile.deleteMany({
                        projectTeamId: projectTeam === null || projectTeam === void 0 ? void 0 : projectTeam._id
                    });
                    //delete all files in storage
                    const fileStoragePath = `${project === null || project === void 0 ? void 0 : project.createdBy}/${projectTeamId}`;
                    yield (0, fileStorage_1.deleteFile)(fileStoragePath);
                    return res.status(200).json(project);
                }
            }
        }
        catch (err) {
            return res.json({ message: "Failed to delete project team: " + err });
        }
    });
}
exports.deleteTeam = deleteTeam;
function updateTeam(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId, projectId, teamMembers, groupAdmins } = req.body;
            const projectTeamId = req.params.id;
            // check project exist and user can edit team
            const project = yield Project_1.Project.findOne({
                _id: projectId,
                $or: [
                    { 'createdBy': userId },
                    { 'projectAdmins': userId },
                    { 'teams.groupAdmins': userId }
                ]
            });
            let projectTeam = yield Project_1.ProjectTeam.findOne({
                _id: projectTeamId
            });
            if (!project || !projectTeam) {
                throw new Error("Project or team not found");
            }
            else {
                if (teamMembers && teamMembers.length > 0) {
                    projectTeam = yield Project_1.ProjectTeam.findByIdAndUpdate({
                        _id: projectTeamId
                    }, {
                        teamMembers
                    });
                }
                if (groupAdmins && groupAdmins.length > 0) {
                    projectTeam = yield Project_1.ProjectTeam.findByIdAndUpdate({
                        _id: projectTeamId
                    }, {
                        groupAdmins
                    });
                }
                return res.status(200).json(projectTeam);
            }
        }
        catch (err) {
            return res.json({ message: "Failed to update team: " + err });
        }
    });
}
exports.updateTeam = updateTeam;
function getAllTeams(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId, projectId } = req.body;
            // we check if user is authorized to see the teams
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
                throw new Error("You are not authorized to see the project teams");
            }
            else {
                const teams = yield Project_1.ProjectTeam.find({
                    projectId,
                    teamMembers: {
                        $in: [userId] //get only teams the user is part of
                    }
                });
                return res.status(200).json({ teams: teams });
            }
        }
        catch (err) {
            return res.json({ message: "Failed to get teams: " + err });
        }
    });
}
exports.getAllTeams = getAllTeams;
function getTeam(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId, projectId } = req.body;
            const projectTeamId = req.params.id;
            // we check if project exist and if user can access the team
            const projectTeam = yield Project_1.ProjectTeam.findOne({
                _id: projectTeamId,
                projectId,
                teamMembers: {
                    $in: [userId] //get only team the user is part
                }
            });
            if (!projectTeam) {
                throw new Error("Team not found");
            }
            else {
                return res.status(200).json(projectTeam);
            }
        }
        catch (err) {
            return res.json({ message: "Failed to get team: " + err });
        }
    });
}
exports.getTeam = getTeam;
function inviteMember(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId, projectId, projectTeamId } = req.body;
            // we check if project exist and if user can invite new members
            const project = yield Project_1.Project.findOne({
                _id: projectId,
                $or: [
                    { 'createdBy': userId },
                    { 'projectAdmins': userId },
                    { 'teams.groupAdmins': userId }
                ]
            });
            if (!project) {
                throw new Error("Project not found");
            }
            else {
                if (!project.teams.includes(projectTeamId)) {
                    throw new Error("This team is not a part of the project.");
                }
                // we invite member by generating a join link to the team
                const newInvitationLink = new InvitationLink_1.InvitationLink({
                    projectTeamId,
                    createdAt: Date.now(),
                    expiredAt: Date.now() + 24 * 3600000 // we expire the link after 24 hours
                });
                const invitationLink = yield newInvitationLink.save();
                return res.status(200).json({
                    invitationLinkId: invitationLink._id
                });
            }
        }
        catch (err) {
            return res.json({ message: "Failed to invite member: " + err });
        }
    });
}
exports.inviteMember = inviteMember;
function joinTeam(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId } = req.body;
            const invitationLinkId = req.params.id;
            // we check if the invitation link exist
            const invitationLink = yield InvitationLink_1.InvitationLink.findOne({
                _id: invitationLinkId,
            });
            if (!invitationLink) {
                throw new Error("Invitation link not found.");
            }
            else {
                // we check if the link is still valid after the 24hours limit
                if (invitationLink.expiredAt.getTime() < new Date().getTime()) {
                    // we delete the invitation link
                    yield InvitationLink_1.InvitationLink.deleteOne({
                        _id: invitationLinkId
                    });
                    throw new Error("Invitation link expired.");
                }
                else {
                    // add user to the team
                    yield Project_1.ProjectTeam.updateOne({
                        _id: invitationLink.projectTeamId
                    }, {
                        $set: {
                            "teamMembers.$": userId
                        }
                    });
                    // redirect to projects page
                    return res.redirect("/start");
                }
            }
        }
        catch (err) {
            return res.json({ message: "Failed to join team: " + err });
        }
    });
}
exports.joinTeam = joinTeam;
