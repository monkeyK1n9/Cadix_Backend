import router from 'express';
import {
    createProject,
    deleteProject,
    updateProject,
    getAllProjects,
    getProject
} from "../middlewares/start";
import { verify } from '../lib/verifyToken';


const startRouter = router.Router();

// CREATE PROJECT
startRouter.post('/', verify, createProject);

// DELETE PROJECT
startRouter.delete('/:id', verify, deleteProject);

// UPDATE PROJECT
startRouter.put('/:id', verify, updateProject);

// GET PROJECTS
startRouter.get('/', verify, getAllProjects);

// GET PROJECT
startRouter.get('/:id', verify, getProject);


export { startRouter };