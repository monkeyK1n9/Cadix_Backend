import { randomUUID } from "crypto";
import { storeFile } from "../lib/fileStorage";
import { Project, ProjectTeam, ProjectVersion } from "../models/project";
import { getStorage } from 'firebase-admin/storage';
import { Message, UploadedFile } from "../models/Message";


/**
 * Middleware to create a new project in database and saving the new file created
 * @param req Request object
 * @param res Response object
 */
export async function createVersion(req: any, res: any) {
    try {
        
        

    }
    catch (err: any) {

    }
}

/**
 * Middleware to delete recursively the project, the related teams, project versions, uploaded files in chats, and messages
 * @param req Request object
 * @param res Response object
 */
export async function deleteVersion(req: any, res: any) {
    try {
       
    }
    catch (err: any) {
        
    }
}

/**
 * Middleware to update a project if the user has authorization to do so.
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
 * Middleware to get all the projects in which a user is found.
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
 * Middleware to get a project if the user is authorized to see it.
 * @param req Request object
 * @param res Response object
 */
export async function getVersion(req: any, res: any) {
    try {
       
    }
    catch(err: any) {
        
    }
}

