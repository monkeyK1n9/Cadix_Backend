import router from 'express';
import { 
    deleteUser, getUser, updateUser 
} from '../middlewares/user';
import { verify } from '../lib/verifyToken';

const userRouter = router.Router();

//DELETE USER
userRouter.post("/", verify, deleteUser);

//UPDATE USER
userRouter.put("/:id", verify, updateUser);

//GET USER
userRouter.get("/:id", verify, getUser);


export { userRouter }