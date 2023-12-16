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
            //we delete user account and remove also out of all
        }
    }
    catch (err: any) {

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