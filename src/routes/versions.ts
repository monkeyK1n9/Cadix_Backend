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
versionsRouter.delete("/:id", verify, deleteVersion);

// UPDATE VERSION
versionsRouter.put("/:id", verify, updateVersion);

// GET VERSIONS
versionsRouter.get("/", verify, getAllVersions);

// GET VERSION
versionsRouter.get("/:id", verify, getVersion);

export { versionsRouter };