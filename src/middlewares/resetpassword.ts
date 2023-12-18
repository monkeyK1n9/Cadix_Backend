import { User } from "../models/User";
import { UserOTPVerification } from "../models/UserOTPVerification";
import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';


export async function resetPassword(req: any, res: any) {
    try {
        const { userId, password, confirmPassword } = req.body;
        const userOTPRecordId = req.params.id;

        // look for the userOTPRecord
        const userOTPRecord = await UserOTPVerification.findOne(
            {
                _id: userOTPRecordId,
                userId,
            }
        )

        if(!userOTPRecord) {
            throw new Error("You cannot reset your password, please try to resend OTP to your email address.");
        }
        else {
            if (password !== confirmPassword) {
                throw new Error("Password and confirm password do not match.");
            }
            else {
                // we change the password
                const oldUser = await User.findOne(
                    {
                        _id: userId
                    }
                )

                if (!oldUser) {
                    throw new Error("User not found.");
                }

                const newUser: any = await User.updateOne(
                    {
                        _id: userId
                    },
                    {
                        password: CryptoJS.AES.encrypt(password, process.env.SECRET_KEY as string).toString()
                    }
                )

                // we deleted the user's records
                await UserOTPVerification.deleteMany({
                    userId
                })
            
                // create an access token and sending back to the client
                const accessToken = jwt.sign(
                    {
                        id: userId
                    },
                    process.env.SECRET_KEY as string, //sending the decrypting secret phrase
                    {
                        expiresIn: "90d"
                    }
                )
            
                // removing password from the data we send back to the client
                const { password: newPassword, ...userInfo } = newUser._doc;
            
                return res.status(200).json({  accessToken, ...userInfo });
            }
        }

    }
    catch (err: any) {
        return res.json({ message: "Failed to change password: " + err });
    }
}