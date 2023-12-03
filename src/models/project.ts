import { randomUUID } from "crypto";
import mongoose from "mongoose";

// to handle different versions of a project
const projectVersionSchema = new mongoose.Schema({
    fileID: {
        type: 'UUID',
        default: () => randomUUID(),
    },
    fileURL: {
        type: String,
        required: true,
    }

}, {
    timestamps: true
})

export const ProjectVersion = mongoose.model('ProjectVersion', projectVersionSchema);


// to handle the different teams a project can have like Architecture, Structural, with client, etc.
const projectTeamSchema = new mongoose.Schema({
    teamID: {
        type: 'UUID',
        default: () => randomUUID(),
        unique: true,
    },
    teamMembers: {
        type: [String], // this will be array of email addresses
    }
}, {
    timestamps: true
});

export const ProjectTeam = mongoose.model('ProjectTeam', projectTeamSchema);


// to handle the effective projectSchema
const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: () => "Project " + randomUUID()
    },
    versions: {
        type: [ProjectVersion],
    },
    teams: {
        type: [ProjectTeam]
    }
}, {
    timestamps: true
});

export const Project = mongoose.model('Project', projectSchema);