import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';
import { UserOTPVerification } from '../models/UserOTPVerification';
// const User = require('../models/User');

/**
 * Middleware to verify the otp the user received by mail and resetting the password
 * @param req request object
 * @param res response object
 */
export async function resetAccountOTP(req: any, res: any) {
    try {

        const {userId, otp} = req.body;
        if (!userId || !otp) {
            throw new Error("Empty otp defails are not allowed")
        }

        const userOTPVerificationRecords = await UserOTPVerification
        .find({
            userId
        })
        .sort({
            createdAt: -1 //sort in descending order. Newest first.
        })

        // check if the user has otp recodrd in database
        if (userOTPVerificationRecords.length <= 0) {
            // we tell the user he has no otp record and needs to sign up
            throw new Error("Account record does not exist or has been verified already. Please sign up or log in")
        }
        else {
            // user otp record exists
            const userOTPRecord = userOTPVerificationRecords[0];
            const encryptedOTP = userOTPVerificationRecords[0].otp;
            
            // check if the otp is still valid after the time passed ( we allowed 60 mins)
            if (userOTPRecord.expiredAt.getTime() < new Date().getTime()){
                // the otp has expired, we delete all user's records
                await UserOTPVerification.deleteMany({
                    userId
                })
                // we throw error to alert about code expiration
                throw new Error("Code has expired. Please request again.")
            }
            else {
                // if time validity is correct, we compare the receive OTP and the one in the database
                const decryptedOTP = CryptoJS.AES.decrypt(encryptedOTP, process.env.SECRET_KEY as string).toString(CryptoJS.enc.Utf8);
                

                if (otp != decryptedOTP) {
                    // supplied code is invalid
                    throw new Error("Invalid code passed. Check your inbox.");
                }
                else {
                    // correct otp, we redirect user to reset password
                    return res.redirect(`/api/v1/resetpassword/${userOTPRecord._id}`)
                }
            }
        }
    }
    catch (err: any) {
        return res.json({
            status: "FAILED",
            message: err.message
        })
    }
}