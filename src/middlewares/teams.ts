import { Project, ProjectTeam } from "../models/Project";


export async function createTeam(req: any, res: any) {
    try {
        const { userId, projectId, groupAdmins, teamMembers } = req.body;

        // user can only create a team if he is a project admin or project owner
        const project = await Project.findOne(
            {
                _id: projectId
            }
        )

        if(!project) {
            throw new Error("Project not found")
        }
        else {
            if(!project.projectAdmins.includes(userId) || project.createdBy != userId) {
                throw new Error("User is not authorized to create a team");
            }
            else {
                // we create the team
                const newProjectTeam = new ProjectTeam({
                    projectId,
                    groupAdmins,
                    teamMembers
                })

                const projectTeam = await newProjectTeam.save();

                //add the team to the project
                await Project.findOneAndUpdate(
                    {
                        _id: projectId
                    },
                    {
                        $push: {
                            teams: projectTeam._id
                        }
                    }
                )

                return res.status(200).json(projectTeam);
            }
        }
    }
    catch(err: any) {
        return res.json({ message: "Failed to create team: " + err });
    }
}

export async function deleteTeam(req: any, res: any) {
    try {
        const { userId } = req.body;
    }
    catch(err: any) {
        
    }
}

export async function updateTeam() {
    try {

    }
    catch(err: any) {
        
    }
}

export async function getAllTeams() {
    try {

    }
    catch(err: any) {
        
    }
}

export async function getTeam() {
    try {

    }
    catch(err: any) {
        
    }
}