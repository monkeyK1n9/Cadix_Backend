import { deleteFile } from "../lib/fileStorage";
import { InvitationLink } from "../models/InvitationLink";
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
        const projectTeamId = req.params.id;

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

                //delete all files in storage
                const fileStoragePath = `${project?.createdBy}/${projectTeamId}`

                await deleteFile(fileStoragePath)

                return res.status(200).json(project);
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
        const projectTeamId = req.params.id;

        // check project exist and user can edit team
        const project = await Project.findOne(
            {
                _id: projectId,
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

        // we check if user is authorized to see the teams
        const project = await Project.findOne(
            {
                _id: projectId,
                $or: [
                    { 'createdBy': userId },
                    { 'projectAdmins': userId },
                    { 'teams.teamMembers': userId },
                    { 'teams.groupAdmins': userId }
                ]
            }
        )

        if(!project) {
            throw new Error("You are not authorized to see the project teams");
        }
        else {
            const teams = await ProjectTeam.find(
                {
                    projectId,
                    teamMembers: {
                        $in: [userId] //get only teams the user is part of
                    }
                }
            )

            return res.status(200).json({ teams: teams });
        }
    }
    catch(err: any) {
        return res.json({ message: "Failed to get teams: " + err });
    }
}

export async function getTeam(req: any, res: any) {
    try {
        const { userId, projectId } = req.body;
        const projectTeamId = req.params.id;

        // we check if project exist and if user can access the team
        const projectTeam = await ProjectTeam.findOne(
            {
                _id: projectTeamId,
                projectId,
                teamMembers: {
                    $in: [userId] //get only team the user is part
                }
            }
        )

        if(!projectTeam) {
            throw new Error("Team not found");
        }
        else {
            return res.status(200).json(projectTeam);
        }
    }
    catch(err: any) {
        return res.json({ message: "Failed to get team: " + err });
    }
}

export async function inviteMember(req: any, res: any) {
    try {
        const { userId, projectId, projectTeamId } = req.body;

        // we check if project exist and if user can invite new members
        const project = await Project.findOne(
            {
                _id: projectId,
                $or: [
                    { 'createdBy': userId },
                    { 'projectAdmins': userId },
                    { 'teams.groupAdmins': userId }
                ]
            }
        );

        if(!project) {
            throw new Error("Project not found");
        }
        else {
            if(!project.teams.includes(projectTeamId)) {
                throw new Error("This team is not a part of the project.");
            }
            // we invite member by generating a join link to the team
            const newInvitationLink = new InvitationLink(
                {
                    projectTeamId,
                    createdAt: Date.now(),
                    expiredAt: Date.now() + 24 * 3600000 // we expire the link after 24 hours
                }
            )

            const invitationLink = await newInvitationLink.save();

            return res.status(200).json(
                {
                    invitationLinkId: invitationLink._id
                }
            )
        }

    }
    catch (err: any) {
        return res.json({ message: "Failed to invite member: " + err });
    }
}

export async function joinTeam(req: any, res: any) {
    try {
        const { userId } = req.body;
        const invitationLinkId = req.params.id;

        // we check if the invitation link exist
        const invitationLink = await InvitationLink.findOne(
            {
                _id: invitationLinkId,
            }
        )

        if(!invitationLink) {
            throw new Error("Invitation link not found.");
        }
        else {
            // we check if the link is still valid after the 24hours limit
            if (invitationLink.expiredAt.getTime() < new Date().getTime()) {
                // we delete the invitation link
                await InvitationLink.deleteOne(
                    {
                        _id: invitationLinkId
                    }
                )

                throw new Error("Invitation link expired.");
            }
            else {
                // add user to the team
                await ProjectTeam.updateOne(
                    {
                        _id: invitationLink.projectTeamId
                    },
                    {
                        $set: {
                            "teamMembers.$": userId
                        }
                    }
                )

                // redirect to projects page
                return res.redirect("/start");
            }
        }
    }
    catch (err) {
        return res.json({ message: "Failed to join team: " + err });
    }
}