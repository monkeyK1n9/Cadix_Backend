import { sendOTPVerificationEmail } from "../lib/sendMail";
import { User } from "../models/User";


export async function sendResetOTP(req: any, res: any) {
    try {
        const { email } = req.body;

        // we look for a user with this email
        const user = await User.findOne(
            { email }
        );

        if(!user) {
            throw new Error("User with this email not found");
        }
        else {
            if(!user.isVerified) {
                throw new Error("Account not verified, register a new account with your email.")
            }
            else {
                // handle account email verification
                await sendOTPVerificationEmail(user, 2);
            

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
    }
    catch (err) {
        return res.json({ message: "Something went wrong: " + err });
    }
}