import { Router } from 'express';
import * as fightController from '../controllers/fightController';

const router = Router();

// GET /fights/:tier/next - Get next available fight by tier
router.get('/:tier/next', fightController.getNextFight);

// GET /fights/:id - Get specific fight
router.get('/:id', fightController.getFight);

export default router; 