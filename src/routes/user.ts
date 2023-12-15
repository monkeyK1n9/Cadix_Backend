import router from 'express';
import { 
    deleteUser, updateUser 
} from '../middlewares/user';

const userRouter = router.Router();

//DELETE USER
userRouter.post("/", deleteUser);

//UPDATE USER
userRouter.post("/update", updateUser);


export { userRouter }