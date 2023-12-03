import { User } from "../models/User";
import CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';

/**
 * Middleware for registering a user with email and password
 * @param req request object
 * @param res response object
 */
export async function registerUser(req: any, res: any) {
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString()
    })

    try {
        // reject request if user email already exists in the database
        const checkUser = await User.findOne({
            email: req.body.email,
        })

        if (checkUser) {
            return res.status(403).json({ message: "User already exists" });
        }

        // create new user
        const user = await newUser.save();
        return res.status(200).json(user);
    }
    catch (err) {
        res.status(500).json({ message: "Failed to create user", error: err})
    }
}