import { PrismaClient, Fight, FightTier, Vote } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as cacheService from './cacheService';
import * as socketService from './socketService';
import * as xpService from './xpService';
import * as analyticsService from './analyticsService';

const prisma = new PrismaClient();

/**
 * Get the next available fight for a specific tier
 * @param tier Fight tier
 * @returns Fight object if available, null otherwise
 */
export async function getNextFight(tier: FightTier): Promise<Fight | null> {
  // Try to get from cache first
  const cachedFight = await cacheService.getNextFight(tier);
  if (cachedFight) return cachedFight;

  // If not in cache, fetch from database
  const now = new Date();
  const fight = await prisma.fight.findFirst({
    where: {
      tier,
      expiresAt: { gt: now },
      scheduledAt: { lte: now },
    },
    orderBy: {
      scheduledAt: 'asc',
    },
  });

  if (!fight) return null;

  // Cache for future requests
  await cacheService.cacheNextFight(tier, fight);
  await cacheService.cacheFight(fight);

  return fight;
}

/**
 * Get a specific fight by ID
 * @param fightId ID of the fight to retrieve
 * @returns Fight object if found, null otherwise
 */
export async function getFight(fightId: string): Promise<Fight | null> {
  // Try to get from cache first
  const cachedFight = await cacheService.getCachedFight(fightId);
  if (cachedFight) return cachedFight;

  // If not in cache, fetch from database
  const fight = await prisma.fight.findUnique({
    where: { id: fightId },
  });

  if (!fight) return null;

  // Cache for future requests
  await cacheService.cacheFight(fight);

  return fight;
}

/**
 * Calculate and update community pick percentages for a fight
 * @param fightId ID of the fight
 * @returns Updated percentages
 */
export async function updateCommunityPicks(fightId: string): Promise<{
  sideAPercentage: number;
  sideBPercentage: number;
  totalVotes: number;
}> {
  // Get vote counts for this fight
  const votes = await prisma.vote.findMany({
    where: { fightId },
    select: { pickedId: true },
  });

  if (votes.length === 0) {
    return { sideAPercentage: 50, sideBPercentage: 50, totalVotes: 0 };
  }

  // Get the fight to determine side IDs
  const fight = await getFight(fightId);
  if (!fight) {
    throw new Error(`Fight not found: ${fightId}`);
  }

  // Count votes for each side
  const sideAVotes = votes.filter((v: any) => v.pickedId === fight.sideAId).length;
  const totalVotes = votes.length;
  
  // Calculate percentages
  const sideAPercentage = Math.round((sideAVotes / totalVotes) * 100);
  const sideBPercentage = 100 - sideAPercentage;

  // Update pickAShare in the database
  await prisma.fight.update({
    where: { id: fightId },
    data: { pickAShare: sideAPercentage / 100 },
  });

  // Cache the updated percentages
  const percentages = { sideAPercentage, sideBPercentage, totalVotes };
  await cacheService.cacheCommunityPicks(fightId, percentages);

  // Broadcast to connected clients via WebSockets
  socketService.updateCommunityPicks(fightId, percentages);

  return percentages;
}

/**
 * Record a vote for a fight
 * @param userId ID of the user voting
 * @param fightId ID of the fight
 * @param pickedId ID of the side picked
 * @returns Vote record and XP awarded
 */
export async function recordVote(
  userId: string,
  fightId: string,
  pickedId: string
): Promise<{
  vote: Vote;
  xpAwarded: number;
  leveledUp: boolean;
  newLevel?: number;
  nextLevelXp?: number;
}> {
  // Get the fight
  const fight = await getFight(fightId);
  if (!fight) {
    throw new Error(`Fight not found: ${fightId}`);
  }

  // Validate the fight is still active
  const now = new Date();
  if (now > fight.expiresAt) {
    throw new Error('Fight has expired');
  }

  // Validate the side ID
  if (pickedId !== fight.sideAId && pickedId !== fight.sideBId) {
    throw new Error(`Invalid side ID: ${pickedId}`);
  }

  // Check if user already voted on this fight
  const existingVote = await prisma.vote.findFirst({
    where: {
      userId,
      fightId,
    },
  });

  if (existingVote) {
    throw new Error('User already voted on this fight');
  }

  // Calculate initial XP award
  // Determine if correct (we'll set this properly later when the fight resolves)
  const isCorrect = pickedId === fight.winnerId;
  
  // Calculate picked side percentage
  let pickShare = 0.5; // Default to 50/50 if no votes yet
  
  if (fight.pickAShare !== 0) {
    // Use cached value from fight
    pickShare = pickedId === fight.sideAId ? fight.pickAShare : 1 - fight.pickAShare;
  }
  
  // Calculate XP award using XP service
  const xpAwarded = xpService.calcXpAward(isCorrect, pickShare);

  // Create the vote record
  const vote = await prisma.vote.create({
    data: {
      id: uuidv4(),
      userId,
      fightId,
      pickedId,
      isCorrect,
      xpAwarded,
      createdAt: now,
    },
  });

  // Update user XP and check for level up
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  const previousLevel = user.level;
  const newXp = user.xp + xpAwarded;
  const newLevel = xpService.calculateLevelFromXP(newXp);
  const leveledUp = newLevel > previousLevel;

  // Update user record
  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXp,
      level: newLevel,
    },
  });

  // Update community pick percentages
  await updateCommunityPicks(fightId);

  // Track analytics
  analyticsService.trackVoteCast(userId, fightId, pickedId);

  if (leveledUp) {
    analyticsService.trackLevelUp(userId, newLevel, newXp);
    
    // Notify user about level up via WebSockets
    const xpProgress = xpService.getXpProgress(newXp);
    socketService.notifyLevelUp(userId, newLevel, xpProgress);
  }

  // Prepare response
  const response: {
    vote: Vote;
    xpAwarded: number;
    leveledUp: boolean;
    newLevel?: number;
    nextLevelXp?: number;
  } = {
    vote,
    xpAwarded,
    leveledUp,
  };

  if (leveledUp) {
    response.newLevel = newLevel;
    response.nextLevelXp = xpService.xpNeededForLevel(newLevel + 1);
  }

  return response;
}

/**
 * Resolve a fight after it has expired
 * @param fightId ID of the fight to resolve
 */
export async function resolveFight(fightId: string): Promise<void> {
  // Get the fight
  const fight = await getFight(fightId);
  if (!fight) {
    throw new Error(`Fight not found: ${fightId}`);
  }

  // Validate that the fight has expired
  const now = new Date();
  if (now < fight.expiresAt) {
    throw new Error('Fight has not yet expired');
  }

  // Get all votes for this fight
  const votes = await prisma.vote.findMany({
    where: { fightId },
    include: { user: true },
  });

  // Update isCorrect for all votes
  for (const vote of votes) {
    const isCorrect = vote.pickedId === fight.winnerId;
    
    await prisma.vote.update({
      where: { id: vote.id },
      data: { isCorrect },
    });

    // Track analytics for vote result
    analyticsService.trackVoteResult(
      vote.userId,
      fightId,
      vote.pickedId,
      fight.winnerId,
      vote.xpAwarded,
      vote.pickedId === fight.sideAId ? fight.pickAShare <= 0.35 : (1 - fight.pickAShare) <= 0.35
    );
  }

  // Calculate final percentages
  const percentages = await updateCommunityPicks(fightId);

  // Create fight outcome object
  const outcome = {
    winnerId: fight.winnerId,
    commentaryTxt: fight.commentaryTxt,
    sideAPercentage: percentages.sideAPercentage,
    sideBPercentage: percentages.sideBPercentage,
    totalVotes: percentages.totalVotes,
  };

  // Cache the outcome
  await cacheService.cacheFightOutcome(fightId, outcome);

  // Broadcast resolution to all clients watching this fight
  socketService.broadcastFightResolution(fightId, outcome);

  // Invalidate cached next fights for this tier
  await cacheService.invalidateNextFights(fight.tier);
}

/**
 * Schedule a new fight
 * @param fight Fight data to schedule
 * @returns Created fight record
 */
export async function scheduleFight(fight: Omit<Fight, 'pickAShare'>): Promise<Fight> {
  // Create the fight in the database
  const newFight = await prisma.fight.create({
    data: {
      ...fight,
      pickAShare: 0,
    },
  });

  // Invalidate cached next fights for this tier
  await cacheService.invalidateNextFights(newFight.tier);

  // Announce the new fight if it's scheduled for now
  const now = new Date();
  if (now >= newFight.scheduledAt) {
    socketService.broadcastNewFight(
      newFight.tier,
      newFight.id,
      newFight.scheduledAt
    );
  }

  return newFight;
}

/**
 * Batch upload multiple fights
 * @param fights Array of fight data to upload
 * @returns Array of created fight records
 */
export async function batchUploadFights(fights: Array<Omit<Fight, 'pickAShare'>>): Promise<Fight[]> {
  const createdFights: Fight[] = [];

  // Use a transaction to ensure all fights are created or none
  await prisma.$transaction(async (tx: any) => {
    for (const fight of fights) {
      const newFight = await tx.fight.create({
        data: {
          ...fight,
          pickAShare: 0,
        },
      });
      createdFights.push(newFight);
    }
  });

  // Invalidate all cached next fights
  await cacheService.invalidateNextFights();

  return createdFights;
}

/**
 * Get global leaderboard
 * @param limit Maximum number of entries to return
 * @returns Array of users sorted by XP
 */
export async function getGlobalLeaderboard(limit: number = 100): Promise<Array<{
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  xp: number;
  level: number;
}>> {
  // Try to get from cache first
  const cachedLeaderboard = await cacheService.getGlobalLeaderboard();
  if (cachedLeaderboard) return cachedLeaderboard;

  // If not in cache, fetch from database
  const users = await prisma.user.findMany({
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      xp: true,
      level: true,
    },
    orderBy: {
      xp: 'desc',
    },
    take: limit,
  });

  // Cache for future requests
  await cacheService.cacheGlobalLeaderboard(users);

  return users;
} 