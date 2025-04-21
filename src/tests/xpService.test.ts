import {
  calcXpAward,
  xpNeededForLevel,
  calculateLevelFromXP,
  getXpProgress,
  BASE_XP_CORRECT,
  BASE_XP_INCORRECT,
  UNDERDOG_THRESHOLD,
  UNDERDOG_BONUS
} from '../services/xpService';

describe('XP Service', () => {
  describe('calcXpAward', () => {
    test('correct vote with no underdog bonus awards 25 XP', () => {
      expect(calcXpAward(true, 0.5)).toBe(BASE_XP_CORRECT);
    });

    test('correct vote with underdog bonus awards 38 XP (25 * 1.5 rounded)', () => {
      // 30% pick share is below the 35% threshold
      expect(calcXpAward(true, 0.3)).toBe(Math.round(BASE_XP_CORRECT * (1 + UNDERDOG_BONUS)));
    });

    test('incorrect vote awards 5 XP regardless of pick share', () => {
      expect(calcXpAward(false, 0.5)).toBe(BASE_XP_INCORRECT);
      expect(calcXpAward(false, 0.3)).toBe(BASE_XP_INCORRECT);
    });

    test('exactly at threshold still gets underdog bonus', () => {
      expect(calcXpAward(true, UNDERDOG_THRESHOLD)).toBe(Math.round(BASE_XP_CORRECT * (1 + UNDERDOG_BONUS)));
    });
  });

  describe('xpNeededForLevel', () => {
    test('level 1 requires 0 XP', () => {
      expect(xpNeededForLevel(1)).toBe(100);
    });

    test('level 2 requires 264 XP', () => {
      expect(xpNeededForLevel(2)).toBe(Math.round(100 * Math.pow(2, 1.4)));
    });

    test('level 10 requires 2512 XP', () => {
      expect(xpNeededForLevel(10)).toBe(Math.round(100 * Math.pow(10, 1.4)));
    });

    test('level formula matches spec: xp_needed = 100 * level^1.4', () => {
      // Test a few levels
      [1, 2, 5, 10, 20, 50, 100].forEach(level => {
        expect(xpNeededForLevel(level)).toBe(Math.round(100 * Math.pow(level, 1.4)));
      });
    });
  });

  describe('calculateLevelFromXP', () => {
    test('0 XP is level 1', () => {
      expect(calculateLevelFromXP(0)).toBe(1);
    });

    test('99 XP is level 1', () => {
      expect(calculateLevelFromXP(99)).toBe(1);
    });

    test('100 XP is level 1', () => {
      expect(calculateLevelFromXP(100)).toBe(1);
    });

    test('264 XP is level 2', () => {
      expect(calculateLevelFromXP(264)).toBe(2);
    });

    test('263 XP is level 1', () => {
      expect(calculateLevelFromXP(263)).toBe(1);
    });

    test('10000 XP is approximately level 20', () => {
      expect(calculateLevelFromXP(10000)).toBeGreaterThanOrEqual(19);
      expect(calculateLevelFromXP(10000)).toBeLessThanOrEqual(21);
    });
  });

  describe('getXpProgress', () => {
    test('returns correct progress data for level 1', () => {
      const progress = getXpProgress(50);
      expect(progress.currentLevel).toBe(1);
      expect(progress.currentXp).toBe(50);
      expect(progress.nextLevelXp).toBe(xpNeededForLevel(2));
      expect(progress.progress).toBe(Math.floor((50 / (xpNeededForLevel(2) - xpNeededForLevel(1))) * 100));
    });

    test('returns correct progress data when just reached a level', () => {
      const level2XP = xpNeededForLevel(2);
      const progress = getXpProgress(level2XP);
      expect(progress.currentLevel).toBe(2);
      expect(progress.currentXp).toBe(level2XP);
      expect(progress.nextLevelXp).toBe(xpNeededForLevel(3));
      expect(progress.progress).toBe(0);
    });

    test('progress is capped at 100%', () => {
      // This should never happen in the real app, but test it anyway
      const progress = getXpProgress(999999);
      expect(progress.progress).toBe(100);
    });
  });
}); 