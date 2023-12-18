import router from 'express';
import { resetPassword } from '../middlewares/resetpassword';

const resetPasswordRouter = router.Router();

//CHANGE PASSWORD
resetPasswordRouter.post("/", resetPassword)


export { resetPasswordRouter }