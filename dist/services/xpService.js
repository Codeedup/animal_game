"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UNDERDOG_BONUS = exports.UNDERDOG_THRESHOLD = exports.BASE_XP_INCORRECT = exports.BASE_XP_CORRECT = void 0;
exports.calcXpAward = calcXpAward;
exports.xpNeededForLevel = xpNeededForLevel;
exports.calculateLevelFromXP = calculateLevelFromXP;
exports.getXpProgress = getXpProgress;
// XP calculation constants
exports.BASE_XP_CORRECT = 25;
exports.BASE_XP_INCORRECT = 5;
exports.UNDERDOG_THRESHOLD = 0.35;
exports.UNDERDOG_BONUS = 0.5; // +50%
/**
 * Calculate XP award for a vote
 * @param isCorrect Whether the vote was for the winning side
 * @param pickShare Share of votes for the selected side (0-1)
 * @returns Amount of XP to award
 */
function calcXpAward(isCorrect, pickShare // 0-1, share of total votes
) {
    const base = isCorrect ? exports.BASE_XP_CORRECT : exports.BASE_XP_INCORRECT;
    // Check if this pick qualifies for underdog bonus (<=35% of votes)
    if (pickShare <= exports.UNDERDOG_THRESHOLD) {
        return Math.round(base * (1 + exports.UNDERDOG_BONUS));
    }
    return base;
}
/**
 * Calculate XP needed to reach a specific level
 * @param level The level to calculate XP requirement for
 * @returns Amount of XP needed
 */
function xpNeededForLevel(level) {
    return Math.round(100 * Math.pow(level, 1.4));
}
/**
 * Calculate the level based on the total XP
 * @param totalXp Total XP accumulated
 * @returns Current level
 */
function calculateLevelFromXP(totalXp) {
    let level = 1;
    while (xpNeededForLevel(level + 1) <= totalXp) {
        level++;
    }
    return level;
}
/**
 * Calculate XP progress information
 * @param totalXp Total XP accumulated
 * @returns Object with level, xp needed for next level, and progress
 */
function getXpProgress(totalXp) {
    const currentLevel = calculateLevelFromXP(totalXp);
    const nextLevelXp = xpNeededForLevel(currentLevel + 1);
    const currentLevelXp = xpNeededForLevel(currentLevel);
    const xpProgress = totalXp - currentLevelXp;
    const xpNeeded = nextLevelXp - currentLevelXp;
    const progress = Math.min(100, Math.floor((xpProgress / xpNeeded) * 100));
    return {
        currentLevel,
        nextLevelXp,
        currentXp: totalXp,
        progress
    };
}
