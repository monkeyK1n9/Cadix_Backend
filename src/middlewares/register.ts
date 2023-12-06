// import { User } from "../models/User";
import CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';
import { sendMail } from '../lib/sendMail';
import { UserOTPVerification } from '../models/UserOTPVerification';
const User = require('../models/User');

/**
 * Middleware for registering a user with email and password
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

        // handle account email verification
        await sendOTPVerificationEmail(user);

        // create an access token and sending back to the client
        const accessToken = jwt.sign(
            {
                id: user._id
            },
            process.env.SECRET_KEY as string, //sending the decrypting secret phrase
            {
                expiresIn: "5d"
            }
        )

        // removing password from the data we send back to the client
        const { password, ...userInfo } = user._doc;

        return res.status(200).json({  accessToken, ...userInfo });
    }
    catch (err) {
        res.status(500).json({ message: "Failed to create user", error: err})
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
            email: user.email
        }
    )

    console.log("Successfully sent OTP verification email")
}