// XP calculation constants
export const BASE_XP_CORRECT = 25;
export const BASE_XP_INCORRECT = 5;
export const UNDERDOG_THRESHOLD = 0.35;
export const UNDERDOG_BONUS = 0.5;  // +50%

/**
 * Calculate XP award for a vote
 * @param isCorrect Whether the vote was for the winning side
 * @param pickShare Share of votes for the selected side (0-1)
 * @returns Amount of XP to award
 */
export function calcXpAward(
  isCorrect: boolean,
  pickShare: number  // 0-1, share of total votes
): number {
  const base = isCorrect ? BASE_XP_CORRECT : BASE_XP_INCORRECT;
  
  // Check if this pick qualifies for underdog bonus (<=35% of votes)
  if (pickShare <= UNDERDOG_THRESHOLD) {
    return Math.round(base * (1 + UNDERDOG_BONUS));
  }
  
  return base;
}

/**
 * Calculate XP needed to reach a specific level
 * @param level The level to calculate XP requirement for
 * @returns Amount of XP needed
 */
export function xpNeededForLevel(level: number): number {
  return Math.round(100 * Math.pow(level, 1.4));
}

/**
 * Calculate the level based on the total XP
 * @param totalXp Total XP accumulated
 * @returns Current level
 */
export function calculateLevelFromXP(totalXp: number): number {
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
export function getXpProgress(totalXp: number): {
  currentLevel: number;
  nextLevelXp: number;
  currentXp: number;
  progress: number;
} {
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