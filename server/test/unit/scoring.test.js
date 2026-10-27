import { describe, it, expect } from 'vitest';
import { DIFFICULTY_BASE_POINTS } from '../../models/CaseStore.js';

describe('Authoritative Scoring Rules', () => {
  function computeScore(difficulty, isCorrect, uniqueCluesCount, hintsUsedCount) {
    const base = isCorrect ? (DIFFICULTY_BASE_POINTS[difficulty] || 0) : 0;
    const clueBonus = uniqueCluesCount * 5;
    const hintPenalty = hintsUsedCount * 10;
    return Math.max(0, base + clueBonus - hintPenalty);
  }

  it('awards exact base bounties on correct accusation', () => {
    expect(computeScore('easy', true, 0, 0)).toBe(100);
    expect(computeScore('medium', true, 0, 0)).toBe(150);
    expect(computeScore('hard', true, 0, 0)).toBe(200);
  });

  it('awards 0 base bounty on wrong accusation', () => {
    expect(computeScore('easy', false, 0, 0)).toBe(0);
    expect(computeScore('medium', false, 0, 0)).toBe(0);
    expect(computeScore('hard', false, 0, 0)).toBe(0);
  });

  it('awards +5 points per discovered clue', () => {
    expect(computeScore('easy', true, 3, 0)).toBe(100 + (3 * 5)); // 115
    expect(computeScore('medium', true, 5, 0)).toBe(150 + (5 * 5)); // 175
    expect(computeScore('hard', true, 9, 0)).toBe(200 + (9 * 5)); // 245
  });

  it('deducts 10 points per declassified hint', () => {
    expect(computeScore('easy', true, 0, 2)).toBe(100 - (2 * 10)); // 80
    expect(computeScore('medium', true, 0, 3)).toBe(150 - (3 * 10)); // 120
    expect(computeScore('hard', true, 0, 3)).toBe(200 - (3 * 10)); // 170
  });

  it('enforces a strict floor limit of 0 points (never negative)', () => {
    // 0 base + 0 clues - 2 hints = -20 => floored to 0
    expect(computeScore('easy', false, 0, 2)).toBe(0);
    // 0 base + 1 clue (+5) - 3 hints (-30) = -25 => floored to 0
    expect(computeScore('medium', false, 1, 3)).toBe(0);
  });

  it('calculates complex gameplay scores accurately', () => {
    // Medium difficulty, correct accusation (+150), 4 clues found (+20), 1 hint used (-10)
    // 150 + 20 - 10 = 160
    expect(computeScore('medium', true, 4, 1)).toBe(160);

    // Hard difficulty, wrong accusation (0), 7 clues found (+35), 2 hints used (-20)
    // 0 + 35 - 20 = 15
    expect(computeScore('hard', false, 7, 2)).toBe(15);
  });
});
