import mongoose from "mongoose";

const userOTPVerificationSchema = new mongoose.Schema({
    userId:  { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    expiredAt: {
        type: Date,
        required: true
    }
})

export const UserOTPVerification = mongoose.model("UserOTPVerification", userOTPVerificationSchema);