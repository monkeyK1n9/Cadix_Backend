import { Project, ProjectVersion } from "../models/Project";

export async function createProject(req: any, res: any) {
    try {
        
        const projectVersion = new ProjectVersion({
            fileURL: "haha"
        })
        const project = new Project({
            name: req.body.projectName,
            
        })
    }
    catch (err) {

    }
}

export async function deleteProject() {

}

export async function updateProject() {

}

export async function getAllProjects() {

}

export async function getProject() {

}

