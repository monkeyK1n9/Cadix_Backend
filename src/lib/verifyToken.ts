import jwt from 'jsonwebtoken';

export const verify = (req: any, res: any, next: any) => {
    const authHeader = req.headers?.token

    if (authHeader) {
        const token = authHeader.split(" ")[1]; //the token in the header will be of the form "Bearer sfsdgsdfsdfsfs", so the actual token will be the second entry of the array when spitted

        jwt.verify(
            token, 
            process.env.SECRET_KEY as string,
            (err: any, data: any) => {
                if (err) return res.status(403).json({msg: "Token is not valid"})

                req.data = data;

                next();
            }
        )
    }
    else {
        return res.status(401).json({msg: "You are not authenticated"}); 
    }
}