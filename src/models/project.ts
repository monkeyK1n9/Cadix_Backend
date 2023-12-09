import { randomUUID } from "crypto";
import mongoose from "mongoose";

// to handle different versions of a project
const projectVersionSchema = new mongoose.Schema({
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
})

export const ProjectVersion = mongoose.model('ProjectVersion', projectVersionSchema);


// to handle the different teams a project can have like Architecture, Structural, with client, etc.
const projectTeamSchema = new mongoose.Schema({
    projectId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },
    teamMembers: {
        type: [String], // this will be array of email addresses
        validate: {
            validator: (value: string) => /\S+@\S+\.\S+/.test(value),
            message: 'Invalid email address format',
        },
    }
}, {
    timestamps: true
});

export const ProjectTeam = mongoose.model('ProjectTeam', projectTeamSchema);


// to handle the effective projectSchema
const projectSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
        default: () => "Project-" + randomUUID()
    },
    versions: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'ProjectVersion' 
        }
    ],
    teams: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'ProjectTeam' 
        }
    ],

}, {
    timestamps: true
});

export const Project = mongoose.model('Project', projectSchema);