
const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API Key authorization with api key
const apiKey = defaultClient.authentication['api-key'];
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
    
    try {

        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // create container to take mail options to be sent
    
    
        sendSmtpEmail = {
            to: receiver,
            templateId,
            params,
            headers: {
                'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2',
                'accept': 'application/json',
                'content-type': 'application/json',
                'api-key': process.env.BREVO_API_KEY
            }
        }
    
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail)

        console.log("Successfully sent email with data: " + data);
    }
    catch (err) {
        console.log("Failed to send mail with error: " + err)
    }

}