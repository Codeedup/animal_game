import express, { Request, Response } from 'express';
const router = express.Router();

// GET / - Get global leaderboard
router.get('/', async (req: Request, res: Response) => {
  // Implementation will be added later
  res.status(200).json({ message: 'Global leaderboard endpoint' });
});

// GET /weekly - Get weekly leaderboard
router.get('/weekly', async (req: Request, res: Response) => {
  // Implementation will be added later
  res.status(200).json({ message: 'Weekly leaderboard endpoint' });
});

// Export the router
export default router; 