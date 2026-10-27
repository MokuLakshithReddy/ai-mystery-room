import { describe, it, expect } from 'vitest';
import { sanitizeCaseForClient } from '../../models/CaseStore.js';
import { FALLBACK_MYSTERIES } from '../../services/fallbackLibrary.js';

describe('Zero-Knowledge Secrecy Boundary', () => {
  const rawActiveCase = {
    ...JSON.parse(JSON.stringify(FALLBACK_MYSTERIES.medium[0])),
    _id: 'case_secret_test_123',
    status: 'active',
    clues: FALLBACK_MYSTERIES.medium[0].clues.map((c, i) => ({
      ...c,
      isDiscovered: i === 0 // only first clue is discovered
    })),
    hints: FALLBACK_MYSTERIES.medium[0].hints.map((h, i) => ({
      ...h,
      isUnlocked: i === 0 // only first hint is unlocked
    })),
    score: { basePoints: 0, clueBonus: 5, hintPenalty: 10, totalScore: 0 }
  };

  it('completely strips the solution object from active cases', () => {
    const sanitized = sanitizeCaseForClient(rawActiveCase);

    expect(sanitized.solution).toBeUndefined();
    expect(sanitized.culprit).toBeUndefined();
    expect(sanitized.playerAccusation).toBeUndefined();
    expect(JSON.stringify(sanitized)).not.toContain(rawActiveCase.solution.solutionBreakdown);
    expect(JSON.stringify(sanitized)).not.toContain(rawActiveCase.solution.motiveExplanation);
  });

  it('masks the detailed description of unexamined clues', () => {
    const sanitized = sanitizeCaseForClient(rawActiveCase);

    // First clue was discovered: description must be visible
    expect(sanitized.clues[0].isDiscovered).toBe(true);
    expect(sanitized.clues[0].description).toBeDefined();

    // Remaining clues are undiscovered: description must be masked/stripped
    for (let i = 1; i < sanitized.clues.length; i++) {
      expect(sanitized.clues[i].isDiscovered).toBe(false);
      expect(sanitized.clues[i].description).toBeUndefined();
      expect(sanitized.clues[i].title).toContain('Unexamined Area');
    }
  });

  it('masks the text of locked forensic hints', () => {
    const sanitized = sanitizeCaseForClient(rawActiveCase);

    // First hint was unlocked: text must be visible
    expect(sanitized.hints[0].isUnlocked).toBe(true);
    expect(sanitized.hints[0].text).toBeDefined();

    // Remaining hints are locked: text must be masked
    for (let i = 1; i < sanitized.hints.length; i++) {
      expect(sanitized.hints[i].isUnlocked).toBe(false);
      expect(sanitized.hints[i].text).toBeUndefined();
      expect(sanitized.hints[i].title).toContain('Forensic Hint #');
    }
  });

  it('retains the solution when case status is completed', () => {
    const rawCompletedCase = {
      ...rawActiveCase,
      status: 'completed',
      playerAccusation: {
        accusedSuspectId: 'suspect_2',
        isCorrect: true,
        submittedAt: new Date()
      }
    };

    const sanitized = sanitizeCaseForClient(rawCompletedCase);
    expect(sanitized.solution).toBeDefined();
    expect(sanitized.solution.culpritId).toBe('suspect_2');
    expect(sanitized.solution.culpritName).toBe('Dr. Julian Mercer');
  });
});
