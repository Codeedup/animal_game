"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
exports.cacheFight = cacheFight;
exports.getCachedFight = getCachedFight;
exports.cacheNextFight = cacheNextFight;
exports.getNextFight = getNextFight;
exports.cacheFightOutcome = cacheFightOutcome;
exports.getFightOutcome = getFightOutcome;
exports.cacheGlobalLeaderboard = cacheGlobalLeaderboard;
exports.getGlobalLeaderboard = getGlobalLeaderboard;
exports.cacheFriendsLeaderboard = cacheFriendsLeaderboard;
exports.getFriendsLeaderboard = getFriendsLeaderboard;
exports.cacheCommunityPicks = cacheCommunityPicks;
exports.getCommunityPicks = getCommunityPicks;
exports.invalidateFight = invalidateFight;
exports.invalidateNextFights = invalidateNextFights;
exports.invalidateGlobalLeaderboard = invalidateGlobalLeaderboard;
exports.getRedisClient = getRedisClient;
const ioredis_1 = __importDefault(require("ioredis"));
const client_1 = require("@prisma/client");
// Initialize Redis client
const redisClient = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
exports.redisClient = redisClient;
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
async function cacheFight(fight) {
    await redisClient.set(KEYS.FIGHT + fight.id, JSON.stringify(fight), 'EX', TTL.FIGHT);
}
/**
 * Get a cached fight by ID
 * @param fightId ID of the fight to retrieve
 * @returns Fight object if found, null otherwise
 */
async function getCachedFight(fightId) {
    const cached = await redisClient.get(KEYS.FIGHT + fightId);
    if (!cached)
        return null;
    return JSON.parse(cached);
}
/**
 * Cache the next available fight for a specific tier
 * @param tier Fight tier
 * @param fight Fight object
 */
async function cacheNextFight(tier, fight) {
    await redisClient.set(KEYS.NEXT_FIGHT + tier, JSON.stringify(fight), 'EX', TTL.FIGHT);
}
/**
 * Get the next available fight for a specific tier
 * @param tier Fight tier
 * @returns Fight object if found, null otherwise
 */
async function getNextFight(tier) {
    const cached = await redisClient.get(KEYS.NEXT_FIGHT + tier);
    if (!cached)
        return null;
    return JSON.parse(cached);
}
/**
 * Cache a fight outcome (after resolution)
 * @param fightId ID of the resolved fight
 * @param outcome Outcome data to cache
 */
async function cacheFightOutcome(fightId, outcome) {
    await redisClient.set(KEYS.FIGHT_OUTCOME + fightId, JSON.stringify(outcome), 'EX', TTL.FIGHT_OUTCOME);
}
/**
 * Get a cached fight outcome
 * @param fightId ID of the resolved fight
 * @returns Outcome data if found, null otherwise
 */
async function getFightOutcome(fightId) {
    const cached = await redisClient.get(KEYS.FIGHT_OUTCOME + fightId);
    if (!cached)
        return null;
    return JSON.parse(cached);
}
/**
 * Cache the global leaderboard
 * @param leaderboard Array of users ranked by XP
 */
async function cacheGlobalLeaderboard(leaderboard) {
    await redisClient.set(KEYS.LEADERBOARD_GLOBAL, JSON.stringify(leaderboard), 'EX', TTL.LEADERBOARD);
}
/**
 * Get the cached global leaderboard
 * @returns Leaderboard data if found, null otherwise
 */
async function getGlobalLeaderboard() {
    const cached = await redisClient.get(KEYS.LEADERBOARD_GLOBAL);
    if (!cached)
        return null;
    return JSON.parse(cached);
}
/**
 * Cache a user's friends leaderboard
 * @param userId ID of the user whose friends to cache
 * @param leaderboard Array of friend users ranked by XP
 */
async function cacheFriendsLeaderboard(userId, leaderboard) {
    await redisClient.set(KEYS.LEADERBOARD_FRIENDS + userId, JSON.stringify(leaderboard), 'EX', TTL.LEADERBOARD);
}
/**
 * Get a cached friends leaderboard
 * @param userId ID of the user whose friends to retrieve
 * @returns Leaderboard data if found, null otherwise
 */
async function getFriendsLeaderboard(userId) {
    const cached = await redisClient.get(KEYS.LEADERBOARD_FRIENDS + userId);
    if (!cached)
        return null;
    return JSON.parse(cached);
}
/**
 * Cache community pick percentages for a fight
 * @param fightId ID of the fight
 * @param percentages Percentage data to cache
 */
async function cacheCommunityPicks(fightId, percentages) {
    await redisClient.set(KEYS.COMMUNITY_PICKS + fightId, JSON.stringify(percentages), 'EX', TTL.COMMUNITY_PICKS);
}
/**
 * Get cached community pick percentages for a fight
 * @param fightId ID of the fight
 * @returns Percentage data if found, null otherwise
 */
async function getCommunityPicks(fightId) {
    const cached = await redisClient.get(KEYS.COMMUNITY_PICKS + fightId);
    if (!cached)
        return null;
    return JSON.parse(cached);
}
/**
 * Invalidate a cached fight
 * @param fightId ID of the fight to invalidate
 */
async function invalidateFight(fightId) {
    await redisClient.del(KEYS.FIGHT + fightId);
    await redisClient.del(KEYS.COMMUNITY_PICKS + fightId);
}
/**
 * Invalidate cached next fights
 * @param tier Optional tier to invalidate (invalidates all tiers if not specified)
 */
async function invalidateNextFights(tier) {
    if (tier) {
        await redisClient.del(KEYS.NEXT_FIGHT + tier);
    }
    else {
        await redisClient.del(KEYS.NEXT_FIGHT + client_1.FightTier.NORMAL, KEYS.NEXT_FIGHT + client_1.FightTier.HOURLY, KEYS.NEXT_FIGHT + client_1.FightTier.DAILY, KEYS.NEXT_FIGHT + client_1.FightTier.WEEKLY);
    }
}
/**
 * Invalidate the global leaderboard
 */
async function invalidateGlobalLeaderboard() {
    await redisClient.del(KEYS.LEADERBOARD_GLOBAL);
}
/**
 * Get a Redis client instance for custom operations
 * @returns Redis client
 */
function getRedisClient() {
    return redisClient;
}
