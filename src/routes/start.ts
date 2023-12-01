import router from 'express';
import {
    createProject,
    deleteProject,
    updateProject,
    getAllProjects,
    getProject
} from "../middlewares/start";


const startRouter = router.Router();

// CREATE PROJECT
startRouter.post('/', createProject);

// DELETE PROJECT
startRouter.delete('/:id', deleteProject);

// UPDATE PROJECT
startRouter.put('/:id', updateProject);

// GET PROJECTS
startRouter.get('/', getAllProjects);

// GET PROJECT
startRouter.get('/:id', getProject);


export { startRouter };