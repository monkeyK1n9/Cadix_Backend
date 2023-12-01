import router from 'express';
import { loginUser } from '../middlewares/login';

const loginRouter = router.Router();

//LOGIN
loginRouter.post("/", loginUser)


export { loginRouter }