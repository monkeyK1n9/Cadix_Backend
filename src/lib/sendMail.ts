import dotenv from 'dotenv';
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