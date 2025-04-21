"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextFight = getNextFight;
exports.getFight = getFight;
exports.updateCommunityPicks = updateCommunityPicks;
exports.recordVote = recordVote;
exports.resolveFight = resolveFight;
exports.scheduleFight = scheduleFight;
exports.batchUploadFights = batchUploadFights;
exports.getGlobalLeaderboard = getGlobalLeaderboard;
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const cacheService = __importStar(require("./cacheService"));
const socketService = __importStar(require("./socketService"));
const xpService = __importStar(require("./xpService"));
const analyticsService = __importStar(require("./analyticsService"));
const prisma = new client_1.PrismaClient();
/**
 * Get the next available fight for a specific tier
 * @param tier Fight tier
 * @returns Fight object if available, null otherwise
 */
async function getNextFight(tier) {
    // Try to get from cache first
    const cachedFight = await cacheService.getNextFight(tier);
    if (cachedFight)
        return cachedFight;
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
    if (!fight)
        return null;
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
async function getFight(fightId) {
    // Try to get from cache first
    const cachedFight = await cacheService.getCachedFight(fightId);
    if (cachedFight)
        return cachedFight;
    // If not in cache, fetch from database
    const fight = await prisma.fight.findUnique({
        where: { id: fightId },
    });
    if (!fight)
        return null;
    // Cache for future requests
    await cacheService.cacheFight(fight);
    return fight;
}
/**
 * Calculate and update community pick percentages for a fight
 * @param fightId ID of the fight
 * @returns Updated percentages
 */
async function updateCommunityPicks(fightId) {
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
    const sideAVotes = votes.filter((v) => v.pickedId === fight.sideAId).length;
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
async function recordVote(userId, fightId, pickedId) {
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
            id: (0, uuid_1.v4)(),
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
    const response = {
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
async function resolveFight(fightId) {
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
        analyticsService.trackVoteResult(vote.userId, fightId, vote.pickedId, fight.winnerId, vote.xpAwarded, vote.pickedId === fight.sideAId ? fight.pickAShare <= 0.35 : (1 - fight.pickAShare) <= 0.35);
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
async function scheduleFight(fight) {
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
        socketService.broadcastNewFight(newFight.tier, newFight.id, newFight.scheduledAt);
    }
    return newFight;
}
/**
 * Batch upload multiple fights
 * @param fights Array of fight data to upload
 * @returns Array of created fight records
 */
async function batchUploadFights(fights) {
    const createdFights = [];
    // Use a transaction to ensure all fights are created or none
    await prisma.$transaction(async (tx) => {
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
async function getGlobalLeaderboard(limit = 100) {
    // Try to get from cache first
    const cachedLeaderboard = await cacheService.getGlobalLeaderboard();
    if (cachedLeaderboard)
        return cachedLeaderboard;
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
