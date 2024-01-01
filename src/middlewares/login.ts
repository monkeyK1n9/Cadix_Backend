import { User } from "../models/User";
import CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';
// const User = require('../models/User');

/**
 * Middleware for logging a user with email and password
 * @param req request object
 * @param res response object
 */
export async function loginUser(req: any, res: any) {
    try {
        const { email, password } = req.body;
        const user: any = await User.findOne({
            email
        }) 

        if (!user) {
            return res.status(401).json({ message: "Wrong email or password" });
        }

        // decrypt the password
        const decryptedPassword = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY as string).toString(CryptoJS.enc.Utf8);

        // check for invalid password
        if (decryptedPassword !== password) {
            return res.status(401).json({ message: "Wrong email or password" });
        }

        // create an access token and sending back to the client
        const accessToken = jwt.sign(
            {
                id: user._id
            },
            process.env.SECRET_KEY as string, //sending the decrypting secret phrase
            {
                expiresIn: "90d"
            }
        )

        // removing password from the data we send back to the client
        const { password: storedPassword, ...userInfo } = user._doc;

        return res.status(200).json({  accessToken, ...userInfo });
    }
    catch (err) {
        return res.status(500).json({ message: "Failed to login user", error: err})
    }
}