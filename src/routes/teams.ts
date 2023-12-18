import router from 'express';
import { 
    createTeam, 
    deleteTeam, 
    getAllTeams, 
    getTeam, 
    inviteMember, 
    updateTeam
} from '../middlewares/teams';
import { verify } from '../lib/verifyToken';


const teamsRouter = router.Router();

// CREATE TEAM
teamsRouter.post('/', verify, createTeam);

// DELETE TEAM
teamsRouter.delete('/:id', verify, deleteTeam);

// UPDATE TEAM
teamsRouter.put('/:id', verify, updateTeam);

// GET TEAMS
teamsRouter.get('/', verify, getAllTeams);

// GET TEAM
teamsRouter.get('/:id', verify, getTeam);

// INVITE MEMBER
teamsRouter.post('/invite', verify, inviteMember);


export { teamsRouter };