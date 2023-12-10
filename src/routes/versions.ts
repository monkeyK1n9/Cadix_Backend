import router from 'express';
import { verify } from '../lib/verifyToken';
import { 
    createVersion, 
    deleteVersion, 
    getAllVersions, 
    getVersion, 
    updateVersion
} from '../middlewares/versions';

const versionsRouter = router.Router();

// CREATE VERSION
versionsRouter.post("/", verify, createVersion);

// DELETE VERSION
versionsRouter.delete("/", verify, deleteVersion);

// UPDATE VERSION
versionsRouter.put("/", verify, updateVersion);

// GET VERSIONS
versionsRouter.get("/", verify, getAllVersions);

// GET VERSION
versionsRouter.get("/", verify, getVersion);

export { versionsRouter };