import router from 'express';
import { resetPassword } from '../middlewares/resetpassword';

const resetPasswordRouter = router.Router();

//CHANGE PASSWORD
resetPasswordRouter.post("/:id", resetPassword)


export { resetPasswordRouter }