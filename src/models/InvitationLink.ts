import mongoose from "mongoose";

const invitationLinkSchema = new mongoose.Schema({
    projectTeamId:  { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ProjectTeam' 
    },
    createdAt: {
        type: Date,
        required: true
    },
    expiredAt: {
        type: Date, // we expire the link after a day
        required: true
    }
})

export const InvitationLink = mongoose.model("InvitationLink", invitationLinkSchema);