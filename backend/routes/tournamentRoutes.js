import express from 'express';
import { getTournaments, getTournamentById, joinTournament } from '../controllers/tournamentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { checkBanned } from '../middlewares/banCheckMiddleware.js';

const router = express.Router();

router.get('/', getTournaments);
router.get('/:id', getTournamentById);
router.post('/:id/join', protect, checkBanned, joinTournament);

export default router;
