import { randomUUID } from "crypto";
import { storeFile } from "../lib/fileStorage";
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
        
        

    }
    catch (err: any) {

    }
}

/**
 * Middleware to delete the version of a project
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

