import { describe, it, expect } from 'vitest';
import { calculateScore, DIFFICULTY_BASE_POINTS } from '../../models/CaseStore.js';

describe('Authoritative Scoring Rules (Production calculateScore)', () => {
  it('awards exact base bounties on correct accusation', () => {
    expect(calculateScore({ difficulty: 'easy', isCorrect: true }).totalScore).toBe(100);
    expect(calculateScore({ difficulty: 'medium', isCorrect: true }).totalScore).toBe(150);
    expect(calculateScore({ difficulty: 'hard', isCorrect: true }).totalScore).toBe(200);
  });

  it('awards 0 base bounty on wrong accusation', () => {
    expect(calculateScore({ difficulty: 'easy', isCorrect: false }).totalScore).toBe(0);
    expect(calculateScore({ difficulty: 'medium', isCorrect: false }).totalScore).toBe(0);
    expect(calculateScore({ difficulty: 'hard', isCorrect: false }).totalScore).toBe(0);
  });

  it('awards +5 points per discovered clue', () => {
    const easyRes = calculateScore({ difficulty: 'easy', isCorrect: true, discoveredCluesCount: 3 });
    expect(easyRes.clueBonus).toBe(15);
    expect(easyRes.totalScore).toBe(115);

    const medRes = calculateScore({ difficulty: 'medium', isCorrect: true, discoveredCluesCount: 5 });
    expect(medRes.clueBonus).toBe(25);
    expect(medRes.totalScore).toBe(175);

    const hardRes = calculateScore({ difficulty: 'hard', isCorrect: true, discoveredCluesCount: 9 });
    expect(hardRes.clueBonus).toBe(45);
    expect(hardRes.totalScore).toBe(245);
  });

  it('deducts 10 points per declassified hint', () => {
    const easyRes = calculateScore({ difficulty: 'easy', isCorrect: true, unlockedHintsCount: 2 });
    expect(easyRes.hintPenalty).toBe(20);
    expect(easyRes.totalScore).toBe(80);

    const medRes = calculateScore({ difficulty: 'medium', isCorrect: true, unlockedHintsCount: 3 });
    expect(medRes.hintPenalty).toBe(30);
    expect(medRes.totalScore).toBe(120);

    const hardRes = calculateScore({ difficulty: 'hard', isCorrect: true, unlockedHintsCount: 3 });
    expect(hardRes.hintPenalty).toBe(30);
    expect(hardRes.totalScore).toBe(170);
  });

  it('enforces a strict floor limit of 0 points (never negative)', () => {
    // 0 base + 0 clues - 2 hints = -20 => floored to 0
    const res1 = calculateScore({ difficulty: 'easy', isCorrect: false, unlockedHintsCount: 2 });
    expect(res1.totalScore).toBe(0);

    // 0 base + 1 clue (+5) - 3 hints (-30) = -25 => floored to 0
    const res2 = calculateScore({ difficulty: 'medium', isCorrect: false, discoveredCluesCount: 1, unlockedHintsCount: 3 });
    expect(res2.totalScore).toBe(0);
  });

  it('calculates complex gameplay scores accurately', () => {
    // Medium difficulty, correct accusation (+150), 4 clues found (+20), 1 hint used (-10)
    // 150 + 20 - 10 = 160
    const resMed = calculateScore({
      difficulty: 'medium',
      isCorrect: true,
      discoveredCluesCount: 4,
      unlockedHintsCount: 1
    });
    expect(resMed.basePoints).toBe(150);
    expect(resMed.clueBonus).toBe(20);
    expect(resMed.hintPenalty).toBe(10);
    expect(resMed.totalScore).toBe(160);

    // Hard difficulty, wrong accusation (0), 7 clues found (+35), 2 hints used (-20)
    // 0 + 35 - 20 = 15
    const resHard = calculateScore({
      difficulty: 'hard',
      isCorrect: false,
      discoveredCluesCount: 7,
      unlockedHintsCount: 2
    });
    expect(resHard.basePoints).toBe(0);
    expect(resHard.clueBonus).toBe(35);
    expect(resHard.hintPenalty).toBe(20);
    expect(resHard.totalScore).toBe(15);
  });
});
