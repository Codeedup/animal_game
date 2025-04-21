import { Router } from 'express';
import * as voteController from '../controllers/voteController';
import { authenticateDevice } from '../middleware/auth';

const router = Router();

// POST /vote - Record a vote for a fight
router.post('/', authenticateDevice, voteController.recordVote);

export default router; 