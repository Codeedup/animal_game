import express, { Request, Response } from 'express';
const router = express.Router();

// GET /dashboard - Admin dashboard
router.get('/dashboard', async (req: Request, res: Response) => {
  // Implementation will be added later
  res.status(200).json({ message: 'Admin dashboard endpoint' });
});

// POST /create-fight - Create a new fight
router.post('/create-fight', async (req: Request, res: Response) => {
  // Implementation will be added later
  res.status(200).json({ message: 'Create fight endpoint' });
});

// Export the router
export default router; 