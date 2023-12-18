import dotenv from 'dotenv';
import CryptoJS from 'crypto-js';
import { UserOTPVerification } from '../models/UserOTPVerification';
var SibApiV3Sdk = require('sib-api-v3-sdk');
var defaultClient = SibApiV3Sdk.ApiClient.instance;
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

// Configure API Key authorization with api key
var apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

type Receiver = {
    name: string,
    email: string 
}

export async function sendMail(
    receiver: Receiver[], 
    templateId: number,
    params: any
) {
    console.log(process.env.BREVO_API_KEY)
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // create container to take mail options to be sent


    sendSmtpEmail = {
        to: receiver,
        templateId: templateId,
        params: params,
        headers: {
            'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2', 
            'accept': 'application/json',
            'content-type': 'application/json',
        }
    }

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail)

    console.log("Successfully sent email with data: " + data);


}


// send OTP to user for email validation
export async function sendOTPVerificationEmail (user: any, templateId: number) {
    // generate otp
    const otp = Math.floor((Math.random() * 9000) + 1000).toString();

    console.log(process.env.SECRET_KEY);
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
        templateId, //templateId in Brevo
        {
            name: user.username,
            otp: otp
        }
    )

    console.log("Successfully sent OTP verification email")
}