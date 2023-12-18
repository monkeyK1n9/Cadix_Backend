import router from 'express';
import { sendResetOTP } from '../middlewares/forgotpassword';

const forgotPasswordRouter = router.Router();

//REQUEST PASSWORD RESET WITH OTP
forgotPasswordRouter.post("/", sendResetOTP)


export { forgotPasswordRouter }