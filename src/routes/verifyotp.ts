import router from 'express';
import { verifyOTP } from '../middlewares/verifyotp';

const verifyOTPRouter = router.Router();

//REGISTER
verifyOTPRouter.post("/", verifyOTP)


export { verifyOTPRouter }