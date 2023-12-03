import { User } from "../models/User";
import CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';

/**
 * Logging a user with email and password
 */
export async function loginUser(req: any, res: any) {
    try {
        const user = await User.findOne({
            email: req.body.email
        }) 

        if (!user) {
            return res.status(401).json({ message: "Wrong email or password" });
        }

        // decrypt the password
        const decryptedPassword = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);

        // check for invalid password
        if (decryptedPassword !== req.body.password) {
            return res.status(401).json({ message: "Wrong email or password" });
        }

        // create an access token and sending back to the client
        const accessToken = jwt.sign(
            {
                id: user._id
            },
            process.env.SECRET_KEY, //sending the decrypting secret phrase
            {
                expiresIn: "5d"
            }
        )

        // removing password from the data we send back to the client
        const { password, ...userInfo } = user

        return res.status(200).json({  accessToken, ...userInfo });
    }
    catch (err) {
        
    }
}