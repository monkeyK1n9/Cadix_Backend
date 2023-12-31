"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamsRouter = void 0;
const express_1 = __importDefault(require("express"));
const teams_1 = require("../middlewares/teams");
const verifyToken_1 = require("../lib/verifyToken");
const teamsRouter = express_1.default.Router();
exports.teamsRouter = teamsRouter;
// CREATE TEAM
teamsRouter.post('/', verifyToken_1.verify, teams_1.createTeam);
// DELETE TEAM
teamsRouter.delete('/:id', verifyToken_1.verify, teams_1.deleteTeam);
// UPDATE TEAM
teamsRouter.put('/:id', verifyToken_1.verify, teams_1.updateTeam);
// GET TEAMS
teamsRouter.get('/', verifyToken_1.verify, teams_1.getAllTeams);
// GET TEAM
teamsRouter.get('/:id', verifyToken_1.verify, teams_1.getTeam);
// GET LINK TO INVITE MEMBER
teamsRouter.get('/invite', verifyToken_1.verify, teams_1.inviteMember);
// JOIN TEAM FROM LINK
teamsRouter.put('/join/:id', teams_1.joinTeam);
