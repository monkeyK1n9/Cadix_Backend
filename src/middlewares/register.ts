// import { User } from "../models/User";
import CryptoJS from 'crypto-js';
import { sendMail } from '../lib/sendMail';
import { UserOTPVerification } from '../models/UserOTPVerification';
const User = require('../models/User');

/**
 * Middleware for registering a user and generating an OTP to be sent by mail and validated
 * @param req request object
 * @param res response object
 */
export async function registerUser(req: any, res: any) {
    console.log(CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY as string).toString())
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY as string).toString()
    })

    let user;

    try {
        // reject request if user email already exists in the database and is verified, otherwise, recreate
        const checkUser = await User.findOne({
            email: req.body.email,
        })

        if (checkUser) {
            if (checkUser.isVerified) {
                //rejecting if user already exists in the database and is verified
                return res.status(403).json({ message: "User already exists" });
            }
            else {
                console.log("User already exists but not verified");

                //if user exists and is not verified we update it
                user = await User.findOneAndUpdate({
                    username: req.body.username,
                    email: req.body.email,
                    password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY as string).toString()
                })

                // handle account email verification
                await sendOTPVerificationEmail(user);
            

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
        await sendOTPVerificationEmail(user);
       

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


// send OTP to user for email validation
async function sendOTPVerificationEmail (user: any) {
    // generate otp
    const otp = Math.floor((Math.random() * 9000) + 1000).toString();

    // hash the otp to save in database
    const newUserOTPVerification = new UserOTPVerification({
        otp: CryptoJS.AES.encrypt(otp, process.env.SECRET_KEY as string).toString(),
        userId: user._id,
        createdAt: Date.now(),
        expiredAt: Date.now() + 3600000 // expire code in 1 hour
    })

    // store otp in database
    await newUserOTPVerification.save();

    // send mail to user
    await sendMail(
        [
            {
                name: user.username,
                email: user.email
            }
        ],
        1, //templateId in Brevo
        {
            name: user.username,
            otp: otp
        }
    )

    console.log("Successfully sent OTP verification email")
}