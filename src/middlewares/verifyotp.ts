import jwt from 'jsonwebtoken';
const User = require('../models/User');

export async function verifyOTP(req: any, res: any) {
    const {data} = req.body;
    // we fetch the stored user in database
    const storedUser = User.findOne({
        _id: data.userId
    })

    // create an access token and sending back to the client
    const accessToken = jwt.sign(
        {
            id: data.userId
        },
        process.env.SECRET_KEY as string, //sending the decrypting secret phrase
        {
            expiresIn: "5d"
        }
    )

    // removing password from the data we send back to the client
    const { password, ...userInfo } = storedUser._doc;

    return res.status(200).json({  accessToken, ...userInfo });
}