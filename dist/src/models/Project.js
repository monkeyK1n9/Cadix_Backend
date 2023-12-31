"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = exports.ProjectTeam = exports.ProjectVersion = void 0;
const crypto_1 = require("crypto");
const mongoose_1 = __importDefault(require("mongoose"));
// to handle different versions of a project
const projectVersionSchema = new mongoose_1.default.Schema({
    fileId: {
        type: String, // a generated random string to name the file. this is not the id of the uploaded file.
    },
    fileURL: {
        type: String,
        required: true,
    },
    versionNumber: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true
});
exports.ProjectVersion = mongoose_1.default.model('ProjectVersion', projectVersionSchema);
// to handle the different teams a project can have like Architecture, Structural, with client, etc.
const projectTeamSchema = new mongoose_1.default.Schema({
    projectId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true
    },
    teamMembers: {
        type: [String], // this will be array of users _id
        required: true,
    },
    groupAdmins: {
        type: [String], // this will be array of group admins' user _id
        required: false
    }
}, {
    timestamps: true
});
exports.ProjectTeam = mongoose_1.default.model('ProjectTeam', projectTeamSchema);
// to handle the effective projectSchema
const projectSchema = new mongoose_1.default.Schema({
    projectName: {
        type: String,
        required: true,
        default: () => "Project-" + (0, crypto_1.randomUUID)()
    },
    description: {
        type: String,
        default: ""
    },
    versions: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'ProjectVersion'
        }
    ],
    teams: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'ProjectTeam'
        }
    ],
    projectAdmins: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    createdBy: {
        type: String, // the creator of the project
        required: true
    }
}, {
    timestamps: true
});
exports.Project = mongoose_1.default.model('Project', projectSchema);
