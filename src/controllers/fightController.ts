import { Request, Response } from 'express';
import { FightTier } from '@prisma/client';
import * as fightService from '../services/fightService';
import * as cacheService from '../services/cacheService';

/**
 * Get the next available fight for a specific tier
 * @route GET /fights/:tier/next
 */
export async function getNextFight(req: Request, res: Response): Promise<void> {
  try {
    const { tier } = req.params;
    
    // Validate tier
    if (!tier || !Object.values(FightTier).includes(tier as FightTier)) {
      res.status(400).json({ error: 'Invalid tier' });
      return;
    }
    
    // Get next fight
    const fight = await fightService.getNextFight(tier as FightTier);
    
    if (!fight) {
      res.status(404).json({ error: 'No available fights found for this tier' });
      return;
    }
    
    // Get community pick percentages for special tiers
    let communityPicks = null;
    if (['HOURLY', 'DAILY', 'WEEKLY'].includes(tier)) {
      communityPicks = await cacheService.getCommunityPicks(fight.id);
      
      // If not in cache, calculate them
      if (!communityPicks) {
        communityPicks = await fightService.updateCommunityPicks(fight.id);
      }
    }
    
    res.json({
      fight_id: fight.id,
      tier: fight.tier,
      scheduled_at: fight.scheduledAt,
      expires_at: fight.expiresAt,
      sides: {
        a: { id: fight.sideAId },
        b: { id: fight.sideBId }
      },
      ...(communityPicks && { community_picks: communityPicks })
    });
    
  } catch (error) {
    console.error('Error fetching next fight:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

/**
 * Get a specific fight by ID
 * @route GET /fights/:id
 */
export async function getFight(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    // Get fight
    const fight = await fightService.getFight(id);
    
    if (!fight) {
      res.status(404).json({ error: 'Fight not found' });
      return;
    }
    
    // Prepare response with fight data
    const response: any = {
      fight_id: fight.id,
      tier: fight.tier,
      scheduled_at: fight.scheduledAt,
      expires_at: fight.expiresAt,
      sides: {
        a: { id: fight.sideAId },
        b: { id: fight.sideBId }
      }
    };
    
    // Check if fight has expired
    const now = new Date();
    const isExpired = now > fight.expiresAt;
    
    // Add community picks for special tiers or outcome for resolved fights
    if (isExpired) {
      // Try to get cached outcome
      const outcome = await cacheService.getFightOutcome(fight.id);
      
      if (outcome) {
        response.winner_id = outcome.winnerId;
        response.commentary_txt = outcome.commentaryTxt;
        response.vote_results = {
          side_a_percentage: outcome.sideAPercentage,
          side_b_percentage: outcome.sideBPercentage,
          total_votes: outcome.totalVotes
        };
      } else {
        // If not in cache, just show basic info
        response.winner_id = fight.winnerId;
      }
    } else if (['HOURLY', 'DAILY', 'WEEKLY'].includes(fight.tier)) {
      // For active special tier fights, show community picks
      const communityPicks = await cacheService.getCommunityPicks(fight.id);
      
      if (communityPicks) {
        response.community_picks = {
          side_a_percentage: communityPicks.sideAPercentage,
          side_b_percentage: communityPicks.sideBPercentage
        };
      }
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('Error fetching fight:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

/**
 * Upload new fights (admin only)
 * @route POST /admin/fights/upload
 */
export async function uploadFights(req: Request, res: Response): Promise<void> {
  try {
    const fights = req.body.fights;
    
    if (!Array.isArray(fights) || fights.length === 0) {
      res.status(400).json({ error: 'Invalid or empty fights array' });
      return;
    }
    
    // Upload fights
    const createdFights = await fightService.batchUploadFights(fights);
    
    res.status(201).json({
      message: `Successfully uploaded ${createdFights.length} fights`,
      count: createdFights.length
    });
    
  } catch (error) {
    console.error('Error uploading fights:', error);
    res.status(500).json({ error: 'Server error' });
  }
} 