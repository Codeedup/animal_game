import Redis from 'ioredis';
import { Fight, FightTier, User } from '@prisma/client';

// Initialize Redis client
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Cache TTL values (in seconds)
const TTL = {
  FIGHT: 60 * 5, // 5 minutes
  FIGHT_OUTCOME: 60 * 60 * 24 * 7, // 1 week
  LEADERBOARD: 60 * 2, // 2 minutes
  USER_PROFILE: 60 * 10, // 10 minutes
  COMMUNITY_PICKS: 60, // 1 minute (updated frequently)
};

// Key prefixes for different types of cached data
const KEYS = {
  FIGHT: 'fight:',
  FIGHT_OUTCOME: 'fight-outcome:',
  NEXT_FIGHT: 'next-fight:',
  LEADERBOARD_GLOBAL: 'leaderboard:global',
  LEADERBOARD_FRIENDS: 'leaderboard:friends:',
  USER_PROFILE: 'user:',
  COMMUNITY_PICKS: 'community-picks:',
};

/**
 * Cache a fight by ID
 * @param fight Fight object to cache
 */
export async function cacheFight(fight: Fight): Promise<void> {
  await redisClient.set(
    KEYS.FIGHT + fight.id,
    JSON.stringify(fight),
    'EX',
    TTL.FIGHT
  );
}

/**
 * Get a cached fight by ID
 * @param fightId ID of the fight to retrieve
 * @returns Fight object if found, null otherwise
 */
export async function getCachedFight(fightId: string): Promise<Fight | null> {
  const cached = await redisClient.get(KEYS.FIGHT + fightId);
  if (!cached) return null;
  return JSON.parse(cached) as Fight;
}

/**
 * Cache the next available fight for a specific tier
 * @param tier Fight tier
 * @param fight Fight object
 */
export async function cacheNextFight(tier: FightTier, fight: Fight): Promise<void> {
  await redisClient.set(
    KEYS.NEXT_FIGHT + tier,
    JSON.stringify(fight),
    'EX',
    TTL.FIGHT
  );
}

/**
 * Get the next available fight for a specific tier
 * @param tier Fight tier
 * @returns Fight object if found, null otherwise
 */
export async function getNextFight(tier: FightTier): Promise<Fight | null> {
  const cached = await redisClient.get(KEYS.NEXT_FIGHT + tier);
  if (!cached) return null;
  return JSON.parse(cached) as Fight;
}

/**
 * Cache a fight outcome (after resolution)
 * @param fightId ID of the resolved fight
 * @param outcome Outcome data to cache
 */
export async function cacheFightOutcome(
  fightId: string,
  outcome: {
    winnerId: string;
    commentaryTxt: string;
    sideAPercentage: number;
    sideBPercentage: number;
    totalVotes: number;
  }
): Promise<void> {
  await redisClient.set(
    KEYS.FIGHT_OUTCOME + fightId,
    JSON.stringify(outcome),
    'EX',
    TTL.FIGHT_OUTCOME
  );
}

/**
 * Get a cached fight outcome
 * @param fightId ID of the resolved fight
 * @returns Outcome data if found, null otherwise
 */
export async function getFightOutcome(
  fightId: string
): Promise<{
  winnerId: string;
  commentaryTxt: string;
  sideAPercentage: number;
  sideBPercentage: number;
  totalVotes: number;
} | null> {
  const cached = await redisClient.get(KEYS.FIGHT_OUTCOME + fightId);
  if (!cached) return null;
  return JSON.parse(cached);
}

/**
 * Cache the global leaderboard
 * @param leaderboard Array of users ranked by XP
 */
export async function cacheGlobalLeaderboard(
  leaderboard: Array<{
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
    xp: number;
    level: number;
  }>
): Promise<void> {
  await redisClient.set(
    KEYS.LEADERBOARD_GLOBAL,
    JSON.stringify(leaderboard),
    'EX',
    TTL.LEADERBOARD
  );
}

/**
 * Get the cached global leaderboard
 * @returns Leaderboard data if found, null otherwise
 */
export async function getGlobalLeaderboard(): Promise<Array<{
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  xp: number;
  level: number;
}> | null> {
  const cached = await redisClient.get(KEYS.LEADERBOARD_GLOBAL);
  if (!cached) return null;
  return JSON.parse(cached);
}

/**
 * Cache a user's friends leaderboard
 * @param userId ID of the user whose friends to cache
 * @param leaderboard Array of friend users ranked by XP
 */
export async function cacheFriendsLeaderboard(
  userId: string,
  leaderboard: Array<{
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
    xp: number;
    level: number;
  }>
): Promise<void> {
  await redisClient.set(
    KEYS.LEADERBOARD_FRIENDS + userId,
    JSON.stringify(leaderboard),
    'EX',
    TTL.LEADERBOARD
  );
}

/**
 * Get a cached friends leaderboard
 * @param userId ID of the user whose friends to retrieve
 * @returns Leaderboard data if found, null otherwise
 */
export async function getFriendsLeaderboard(
  userId: string
): Promise<Array<{
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  xp: number;
  level: number;
}> | null> {
  const cached = await redisClient.get(KEYS.LEADERBOARD_FRIENDS + userId);
  if (!cached) return null;
  return JSON.parse(cached);
}

/**
 * Cache community pick percentages for a fight
 * @param fightId ID of the fight
 * @param percentages Percentage data to cache
 */
export async function cacheCommunityPicks(
  fightId: string,
  percentages: {
    sideAPercentage: number;
    sideBPercentage: number;
    totalVotes: number;
  }
): Promise<void> {
  await redisClient.set(
    KEYS.COMMUNITY_PICKS + fightId,
    JSON.stringify(percentages),
    'EX',
    TTL.COMMUNITY_PICKS
  );
}

/**
 * Get cached community pick percentages for a fight
 * @param fightId ID of the fight
 * @returns Percentage data if found, null otherwise
 */
export async function getCommunityPicks(
  fightId: string
): Promise<{
  sideAPercentage: number;
  sideBPercentage: number;
  totalVotes: number;
} | null> {
  const cached = await redisClient.get(KEYS.COMMUNITY_PICKS + fightId);
  if (!cached) return null;
  return JSON.parse(cached);
}

/**
 * Invalidate a cached fight
 * @param fightId ID of the fight to invalidate
 */
export async function invalidateFight(fightId: string): Promise<void> {
  await redisClient.del(KEYS.FIGHT + fightId);
  await redisClient.del(KEYS.COMMUNITY_PICKS + fightId);
}

/**
 * Invalidate cached next fights
 * @param tier Optional tier to invalidate (invalidates all tiers if not specified)
 */
export async function invalidateNextFights(tier?: FightTier): Promise<void> {
  if (tier) {
    await redisClient.del(KEYS.NEXT_FIGHT + tier);
  } else {
    await redisClient.del(
      KEYS.NEXT_FIGHT + FightTier.NORMAL,
      KEYS.NEXT_FIGHT + FightTier.HOURLY,
      KEYS.NEXT_FIGHT + FightTier.DAILY,
      KEYS.NEXT_FIGHT + FightTier.WEEKLY
    );
  }
}

/**
 * Invalidate the global leaderboard
 */
export async function invalidateGlobalLeaderboard(): Promise<void> {
  await redisClient.del(KEYS.LEADERBOARD_GLOBAL);
}

/**
 * Get a Redis client instance for custom operations
 * @returns Redis client
 */
export function getRedisClient(): Redis {
  return redisClient;
}

// Export the Redis client for direct use if needed
export { redisClient }; 