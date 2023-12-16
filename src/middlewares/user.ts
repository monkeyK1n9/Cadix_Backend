import { deleteFile } from "../lib/fileStorage";
import { Message, UploadedFile } from "../models/Message";
import { Project, ProjectTeam, ProjectVersion } from "../models/Project";
import { User } from "../models/User";
// const User = require('../models/User');


export async function deleteUser(req: any, res: any) {
    try {
        const { userId } = req.params;

        // check if user exists
        const user = await User.findOne(
            {
                _id: userId
            }
        )

        if (!user) {
            throw new Error("User not found")
        }
        else {
            //we delete user account and remove also all teams and projects where they are group admins (teams), project owners or project admins

            // take the created projects
            const projects = await Project.find(
                { projectAdmins: { $in: [userId] } }, // User is a project admin
            )

            if (projects.length > 0) {
                // we now delete all projects 
                for(let i = 0; i < projects.length; i++) {
                    // 1- delete all messages and UploadFile
                    if (projects[i].teams?.length >= 0) {
                        for (let i = 0; i < projects[i].teams.length; i++) {
                            await Message.deleteMany({
                                projectTeamId: projects[i].teams[i]
                            })
                            await UploadedFile.deleteMany({
                                projectTeamId: projects[i].teams[i]
                            })
                        }
                    }

                    // 2- delete project versions and files versions and messages attachement files
                    if (projects[i].versions?.length >= 0) {
                        for (let i = 0; i < projects[i].versions.length; i++) {
                            await ProjectVersion.deleteOne({
                                _id: projects[i].versions[i]
                            })
                        }
                    }
                    await deleteFile(projects[i].createdBy);

                    // 3- delete all project teams
                    if (projects[i].teams?.length >= 0) {
                        for (let i = 0; i < projects[i].teams.length; i++) {
                            await ProjectTeam.deleteOne({
                                _id: projects[i].teams[i]
                            })
                        }
                    }

                    // 4- finally delete the project
                    await Project.deleteOne({
                        _id: projects[i]._id
                    })
                }
            }

            // take any remaining teams not deleted because user is only group admin
            const teams = await ProjectTeam.find(
                { groupAdmins: { $in: [userId] } }, // User is a group admin
            )


            if (teams?.length >= 0) {
                for(let i = 0; i < teams.length; i++) {
                    // 1- delete all messages and UploadFile
                    await Message.deleteMany({
                        projectTeamId: teams[i]._id
                    })
                    await UploadedFile.deleteMany({
                        projectTeamId: teams[i]._id
                    })

                    // 2- delete the team
                    await ProjectTeam.deleteOne({
                        _id: projects[i].teams[i]
                    })
                }
            }

            return res.status(200).json({ message: "Successfully deleted user account, created project and related files." })
        }
    }
    catch (err: any) {
        return res.json({ message: "Error deleting user account: " + err });
    }
}

export async function updateUser(req: any, res: any) {
    try {
        const { userId } = req.params;

        // check if user exists
        const user = await User.findOne(
            {
                _id: userId
            }
        )

        if (!user) {
            throw new Error("User not found")
        }
        else {
            // we update the project
            for(const [key, value] of Object.entries(user)) {

                await User.findOneAndUpdate(
                    {
                        _id: userId // we filter by project Id
                    },
                    {
                        [key]: value    // we update the key value pair
                    }
                )
            }

            const newUser: any = await User.findOne({
                _id: userId
            })

            const { password, ...userInfo } = newUser._doc;

            return res.status(200).json(userInfo)
        }        
    }
    catch (err: any) {
        return res.json({ message: "Failed to update user: " + err });
    }
}

export async function getUser(req: any, res: any) {
    try {
        const { userId } = req.params;

        // try to get user
        const user: any = await User.findOne(
            {
                _id: userId
            }
        )

        if(!user) {
            throw new Error("User not found");
        }
        else {
            const { password, ...userInfo } = user._doc;

            return res.status(200).json(userInfo);
        }
    }
    catch (err: any) {
        return res.json({ message: "Failed to get user: " + err });
    }
}