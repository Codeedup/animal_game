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
exports.recordVote = recordVote;
const fightService = __importStar(require("../services/fightService"));
/**
 * Record a vote for a fight
 * @route POST /vote
 */
async function recordVote(req, res) {
    var _a;
    try {
        const { fightId, pickedId } = req.body;
        // Validate required fields
        if (!fightId || !pickedId) {
            res.status(400).json({ error: 'Missing required fields: fightId and pickedId are required' });
            return;
        }
        // Get user ID from the authenticated user (handled by auth middleware)
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
    }
    catch (error) {
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
        }
        else {
            console.error('Unknown error recording vote:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
}
