import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilePic: {
        type: String,
        default: ""
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    projects: {
        type: [String],
        default: undefined,
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
})

// export const User = mongoose.model("User", UserSchema);
module.exports = mongoose.model("User", UserSchema);