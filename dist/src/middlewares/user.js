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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.updateUser = exports.deleteUser = void 0;
const fileStorage_1 = require("../lib/fileStorage");
const Message_1 = require("../models/Message");
const Project_1 = require("../models/Project");
const User_1 = require("../models/User");
// const User = require('../models/User');
function deleteUser(req, res) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId } = req.body;
            // check if user exists
            const user = yield User_1.User.findOne({
                _id: userId
            });
            if (!user) {
                throw new Error("User not found");
            }
            else {
                //we delete user account and remove also all teams and projects where they are group admins (teams), project owners or project admins
                // take the created projects
                const projects = yield Project_1.Project.find({ projectAdmins: { $in: [userId] } });
                if (projects.length > 0) {
                    // we now delete all projects 
                    for (let i = 0; i < projects.length; i++) {
                        // 1- delete all messages and UploadFile
                        if (((_a = projects[i].teams) === null || _a === void 0 ? void 0 : _a.length) >= 0) {
                            for (let i = 0; i < projects[i].teams.length; i++) {
                                yield Message_1.Message.deleteMany({
                                    projectTeamId: projects[i].teams[i]
                                });
                                yield Message_1.UploadedFile.deleteMany({
                                    projectTeamId: projects[i].teams[i]
                                });
                            }
                        }
                        // 2- delete project versions and files versions and messages attachement files
                        if (((_b = projects[i].versions) === null || _b === void 0 ? void 0 : _b.length) >= 0) {
                            for (let i = 0; i < projects[i].versions.length; i++) {
                                yield Project_1.ProjectVersion.deleteOne({
                                    _id: projects[i].versions[i]
                                });
                            }
                        }
                        yield (0, fileStorage_1.deleteFile)(projects[i].createdBy);
                        // 3- delete all project teams
                        if (((_c = projects[i].teams) === null || _c === void 0 ? void 0 : _c.length) >= 0) {
                            for (let i = 0; i < projects[i].teams.length; i++) {
                                yield Project_1.ProjectTeam.deleteOne({
                                    _id: projects[i].teams[i]
                                });
                            }
                        }
                        // 4- finally delete the project
                        yield Project_1.Project.deleteOne({
                            _id: projects[i]._id
                        });
                    }
                }
                // take any remaining teams not deleted because user is only group admin
                const teams = yield Project_1.ProjectTeam.find({ groupAdmins: { $in: [userId] } });
                if ((teams === null || teams === void 0 ? void 0 : teams.length) >= 0) {
                    for (let i = 0; i < teams.length; i++) {
                        // 1- delete all messages and UploadFile
                        yield Message_1.Message.deleteMany({
                            projectTeamId: teams[i]._id
                        });
                        yield Message_1.UploadedFile.deleteMany({
                            projectTeamId: teams[i]._id
                        });
                        // 2- delete the team
                        yield Project_1.ProjectTeam.deleteOne({
                            _id: projects[i].teams[i]
                        });
                    }
                }
                return res.status(200).json({ message: "Successfully deleted user account, created project and related files." });
            }
        }
        catch (err) {
            return res.json({ message: "Error deleting user account: " + err });
        }
    });
}
exports.deleteUser = deleteUser;
function updateUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { file, username } = req.body;
            const userId = req.params.id;
            // check if user exists
            const user = yield User_1.User.findOne({
                _id: userId
            });
            if (!user) {
                throw new Error("User not found");
            }
            else {
                // store file in db
                let imageURL = "";
                if (file) {
                    const arrayBuffer = yield file.arrayBuffer(); // converting blob file to bufferArray
                    const fileData = yield Buffer.from(arrayBuffer); // convert arrayBuffer to buffer
                    const fileStoragePath = `${userId}/profile`;
                    imageURL = yield (0, fileStorage_1.storeFile)("profile", fileStoragePath, fileData);
                }
                const storeUser = { username, imageURL };
                // we update the project
                for (const [key, value] of Object.entries(storeUser)) {
                    if (key && value) {
                        yield User_1.User.findOneAndUpdate({
                            _id: userId // we filter by project Id
                        }, {
                            [key]: value // we update the key value pair
                        });
                    }
                }
                const newUser = yield User_1.User.findOne({
                    _id: userId
                });
                const _a = newUser._doc, { password } = _a, userInfo = __rest(_a, ["password"]);
                return res.status(200).json(userInfo);
            }
        }
        catch (err) {
            return res.json({ message: "Failed to update user: " + err });
        }
    });
}
exports.updateUser = updateUser;
function getUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.params.id;
            // try to get user
            const user = yield User_1.User.findOne({
                _id: userId
            });
            if (!user) {
                throw new Error("User not found");
            }
            else {
                const _a = user._doc, { password } = _a, userInfo = __rest(_a, ["password"]);
                return res.status(200).json(userInfo);
            }
        }
        catch (err) {
            return res.json({ message: "Failed to get user: " + err });
        }
    });
}
exports.getUser = getUser;
