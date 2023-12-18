import { User } from "../models/User";
import CryptoJS from 'crypto-js';
import { sendOTPVerificationEmail } from '../lib/sendMail';
// const User = require('../models/User');

/**
 * Middleware for registering a user and generating an OTP to be sent by mail and validated
 * @param req request object
 * @param res response object
 */
export async function registerUser(req: any, res: any) {
    const { email, username, password, confirmPassword } = req.body;

    const newUser: any = new User({
        username,
        email,
        password: CryptoJS.AES.encrypt(password, process.env.SECRET_KEY as string).toString()
    })

    let user: any;

    try {
        // reject request if user email already exists in the database and is verified, otherwise, recreate
        const checkUser = await User.findOne(
            {
                email,
            }
        )

        if (checkUser) {
            if (checkUser.isVerified) {
                //rejecting if user already exists in the database and is verified
                return res.status(403).json({ message: "User already exists" });
            }
            else {
                if (password !== confirmPassword) {
                    throw new Error("Password and confirm password do not match.")
                }
                console.log("User already exists but not verified");

                //if user exists and is not verified we update it
                user = await User.findOneAndUpdate(
                    {
                        email, // we filter user by email and update it
                    }, 
                    {
                        username,
                        email,
                        password: CryptoJS.AES.encrypt(password, process.env.SECRET_KEY as string).toString()
                    },
                    {
                        new: true, // we use this to return the updated document
                    }
                )

                // handle account email verification
                await sendOTPVerificationEmail(user, 1);
            

                return res.status(200).json({  
                    status: 'PENDING',
                    message: "Verification otp email sent",
                    data: {
                        userId: user._id,
                        email: user.email
                    }
                });
            }
        }

        // create new user
        user = await newUser.save();

        // handle account email verification
        await sendOTPVerificationEmail(user, 1);
       

        return res.status(200).json({  
            status: 'PENDING',
            message: "Verification otp email sent",
            data: {
                userId: user._id,
                email: user.email
            }
        });
    }
    catch (err) {
        console.log("Error: ", err);

        res.status(500).json({ message: "Something went wrong. Failed to create user", error: err})
    }
}