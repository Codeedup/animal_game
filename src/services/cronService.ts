import { PrismaClient, FightTier } from '@prisma/client';
import { schedule } from 'node-cron';
import * as fightService from './fightService';

const prisma = new PrismaClient();

// Initialize cron jobs
export function initializeCronJobs(): void {
  // Every 6 hours at the top of the hour (0:00, 6:00, 12:00, 18:00 UTC)
  schedule('0 0,6,12,18 * * *', publishHourlyFights);

  // Daily at 3:00 and 15:00 UTC
  schedule('0 3,15 * * *', publishDailyFights);

  // Weekly on Friday at 20:00 UTC
  schedule('0 20 * * FRI', publishWeeklyFight);

  // Check for fights to resolve every 5 minutes
  schedule('*/5 * * * *', checkForFightsToResolve);

  console.log('Cron jobs initialized');
}

/**
 * Publish hourly fights
 */
async function publishHourlyFights(): Promise<void> {
  console.log('Publishing hourly fights');
  await pickAndActivateFights(FightTier.HOURLY, 1);
}

/**
 * Publish daily fights
 */
async function publishDailyFights(): Promise<void> {
  console.log('Publishing daily fights');
  await pickAndActivateFights(FightTier.DAILY, 1);
}

/**
 * Publish weekly fight
 */
async function publishWeeklyFight(): Promise<void> {
  console.log('Publishing weekly fight');
  await pickAndActivateFights(FightTier.WEEKLY, 1);
}

/**
 * Pick and activate fights from the pre-computed pool
 * @param tier Fight tier
 * @param count Number of fights to activate
 */
async function pickAndActivateFights(tier: FightTier, count: number): Promise<void> {
  try {
    const now = new Date();
    
    // Define fight duration based on tier
    const durationHours = {
      [FightTier.HOURLY]: 6, // 6 hours for hourly fights
      [FightTier.DAILY]: 12, // 12 hours for daily fights
      [FightTier.WEEKLY]: 24, // 24 hours for weekly fights
      [FightTier.NORMAL]: 2, // 2 hours for normal fights
    };
    
    // Calculate expiration time
    const expiresAt = new Date(now.getTime() + durationHours[tier] * 60 * 60 * 1000);
    
    // Find fights that are scheduled for this tier but not yet activated
    const availableFights = await prisma.fight.findMany({
      where: {
        tier,
        scheduledAt: null, // Not yet scheduled
      },
      take: count,
    });
    
    if (availableFights.length === 0) {
      console.log(`No ${tier} fights available in the pool`);
      return;
    }
    
    // Activate each fight
    for (const fight of availableFights) {
      await prisma.fight.update({
        where: { id: fight.id },
        data: {
          scheduledAt: now,
          expiresAt,
        },
      });
      
      console.log(`Activated ${tier} fight: ${fight.id}`);
    }
    
  } catch (error) {
    console.error(`Error activating ${tier} fights:`, error);
  }
}

/**
 * Check for fights that have expired and need to be resolved
 */
async function checkForFightsToResolve(): Promise<void> {
  try {
    const now = new Date();
    
    // Find expired fights that haven't been resolved yet
    const expiredFights = await prisma.fight.findMany({
      where: {
        expiresAt: { lt: now },
        resolved: false,
      },
    });
    
    if (expiredFights.length === 0) {
      return; // No fights to resolve
    }
    
    console.log(`Found ${expiredFights.length} expired fights to resolve`);
    
    // Resolve each fight
    for (const fight of expiredFights) {
      try {
        await fightService.resolveFight(fight.id);
        console.log(`Resolved fight: ${fight.id}`);
      } catch (error) {
        console.error(`Error resolving fight ${fight.id}:`, error);
      }
    }
    
  } catch (error) {
    console.error('Error checking for fights to resolve:', error);
  }
} 