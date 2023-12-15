import { User } from "../models/User";
// const User = require('../models/User');


export async function deleteUser(req: any, res: any) {
    try {
        const { userId } = req.body;

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

        }
    }
    catch (err: any) {

    }
}

export async function updateUser(req: any, res: any) {
    try {

    }
    catch (err: any) {

    }
}

export async function getUser(req: any, res: any) {
    try {

    }
    catch (err: any) {

    }
}