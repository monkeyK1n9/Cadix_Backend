import router from 'express';
import { registerUser } from '../middlewares/register';

const registerRouter = router.Router();

//REGISTER
registerRouter.post("/", registerUser)


export { registerRouter }