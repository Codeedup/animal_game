import express, { Request, Response } from 'express';
const router = express.Router();

// GET /items - Get all store items
router.get('/items', async (req: Request, res: Response) => {
  // Implementation will be added later
  res.status(200).json({ message: 'Store items endpoint' });
});

// POST /purchase - Purchase an item
router.post('/purchase', async (req: Request, res: Response) => {
  // Implementation will be added later
  res.status(200).json({ message: 'Purchase item endpoint' });
});

// Export the router
export default router; 