import router from 'express';
import { registerUser, loginUser } from '../middlewares/auth';

const authRouter = router.Router();

//REGISTER
authRouter.post("/register", registerUser)

//LOGIN
authRouter.post("/login", loginUser)


export { authRouter }