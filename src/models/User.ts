import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: (value: string) => /\S+@\S+\.\S+/.test(value),
            message: 'Invalid email address format',
        },
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    imageURL: {
        type: String,
        default: ""
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
})

export const User = mongoose.model("User", UserSchema);
// module.exports = mongoose.model("User", UserSchema);