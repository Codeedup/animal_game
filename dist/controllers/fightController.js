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
exports.uploadFights = uploadFights;
const client_1 = require("@prisma/client");
const fightService = __importStar(require("../services/fightService"));
const cacheService = __importStar(require("../services/cacheService"));
/**
 * Get the next available fight for a specific tier
 * @route GET /fights/:tier/next
 */
async function getNextFight(req, res) {
    try {
        const { tier } = req.params;
        // Validate tier
        if (!tier || !Object.values(client_1.FightTier).includes(tier)) {
            res.status(400).json({ error: 'Invalid tier' });
            return;
        }
        // Get next fight
        const fight = await fightService.getNextFight(tier);
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
    }
    catch (error) {
        console.error('Error fetching next fight:', error);
        res.status(500).json({ error: 'Server error' });
    }
}
/**
 * Get a specific fight by ID
 * @route GET /fights/:id
 */
async function getFight(req, res) {
    try {
        const { id } = req.params;
        // Get fight
        const fight = await fightService.getFight(id);
        if (!fight) {
            res.status(404).json({ error: 'Fight not found' });
            return;
        }
        // Prepare response with fight data
        const response = {
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
            }
            else {
                // If not in cache, just show basic info
                response.winner_id = fight.winnerId;
            }
        }
        else if (['HOURLY', 'DAILY', 'WEEKLY'].includes(fight.tier)) {
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
    }
    catch (error) {
        console.error('Error fetching fight:', error);
        res.status(500).json({ error: 'Server error' });
    }
}
/**
 * Upload new fights (admin only)
 * @route POST /admin/fights/upload
 */
async function uploadFights(req, res) {
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
    }
    catch (error) {
        console.error('Error uploading fights:', error);
        res.status(500).json({ error: 'Server error' });
    }
}
