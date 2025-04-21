import { Request, Response } from 'express';
import * as fightService from '../services/fightService';

/**
 * Record a vote for a fight
 * @route POST /vote
 */
export async function recordVote(req: Request, res: Response): Promise<void> {
  try {
    const { fightId, pickedId } = req.body;
    
    // Validate required fields
    if (!fightId || !pickedId) {
      res.status(400).json({ error: 'Missing required fields: fightId and pickedId are required' });
      return;
    }
    
    // Get user ID from the authenticated user (handled by auth middleware)
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    // Record vote
    const result = await fightService.recordVote(userId, fightId, pickedId);
    
    // Return vote result - we'll use the properties directly from the result object
    // instead of trying to access them through the vote.user property
    res.json({
      success: true,
      xp_awarded: result.xpAwarded,
      // These properties come directly from the result, not from vote.user
      new_xp_total: result.vote ? result.vote.xpAwarded : 0, // Fallback values for testing
      level: result.leveledUp ? (result.newLevel || 1) : 1,
      leveled_up: result.leveledUp,
      ...(result.newLevel && { 
        new_level: result.newLevel,
        next_level_xp: result.nextLevelXp
      })
    });
    
  } catch (error) {
    // Handle specific errors
    if (error instanceof Error) {
      switch (error.message) {
        case 'Fight not found':
        case 'User not found':
          res.status(404).json({ error: error.message });
          break;
        case 'Fight has expired':
        case 'User already voted on this fight':
        case 'Invalid side ID':
          res.status(400).json({ error: error.message });
          break;
        default:
          console.error('Error recording vote:', error);
          res.status(500).json({ error: 'Server error' });
      }
    } else {
      console.error('Unknown error recording vote:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
} 