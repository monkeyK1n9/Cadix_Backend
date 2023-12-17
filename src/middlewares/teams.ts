import { Message, UploadedFile } from "../models/Message";
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
        const { userId, projectId } = req.body;
        const { projectTeamId } = req.params;

        //we check if the team exists
        let projectTeam = await ProjectTeam.findOne(
            { _id: projectTeamId }
        )

        if(!projectTeam) {
            throw new Error("Project team not found");
        }
        else {
            // we obtain the project
            let project = await Project.findOne({
                _id: projectId,
                $or: [
                    { 'createdBy': userId },
                    { 'projectAdmins': userId },
                ]
            })

            if(!project) {
                throw new Error("Project not found or you are not allowed to delete project team");
            }
            else {
                if (!project.teams.includes(projectTeamId)) {
                    throw new Error("Team not included in the project.")
                }
                // we remove the team from the project
                projectTeam = await ProjectTeam.findOneAndDelete(
                    { _id: projectTeamId }
                );

                project = await Project.findOneAndUpdate(
                    { _id: projectId },
                    {
                        $pull: {
                            teams: projectTeam?._id
                        }
                    }
                )

                //delete all messages and files of team
                await Message.deleteMany({
                    projectTeamId: projectTeam?._id
                })
                await UploadedFile.deleteMany({
                    projectTeamId: projectTeam?._id
                })
            }
        }
    }
    catch(err: any) {
        return res.json({ message: "Failed to delete project team: " + err });
    }
}

export async function updateTeam(req: any, res: any) {
    try {
        const { userId, projectId, teamMembers, groupAdmins } = req.body;
        const { projectTeamId } = req.params;

        // check project exist and user can edit team
        const project = await Project.findOne(
            {
                _id: projectId
            },
            {
                $or: [
                    { 'createdBy': userId },
                    { 'projectAdmins': userId },
                    { 'teams.groupAdmins': userId }
                ]
            }
        )

        let projectTeam = await ProjectTeam.findOne(
            {
                _id: projectTeamId
            }
        )

        if(!project || !projectTeam) {
            throw new Error("Project or team not found");
        }
        else {
            if(teamMembers && teamMembers.length > 0) {
                projectTeam = await ProjectTeam.findByIdAndUpdate(
                    {
                        _id: projectTeamId
                    },
                    {
                        teamMembers
                    }
                )
            }

            if(groupAdmins && groupAdmins.length > 0) {
                projectTeam = await ProjectTeam.findByIdAndUpdate(
                    {
                        _id: projectTeamId
                    },
                    {
                        groupAdmins
                    }
                )
            }

            return res.status(200).json(projectTeam);
        }

    }
    catch(err: any) {
        return res.json({ message: "Failed to update team: " + err });
    }
}

export async function getAllTeams(req: any, res: any) {
    try {
        const { userId, projectId } = req.body;
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