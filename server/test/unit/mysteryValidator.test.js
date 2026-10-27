import { describe, it, expect } from 'vitest';
import { 
  validateMystery, 
  DIFFICULTY_CONFIG, 
  VALID_DIFFICULTIES 
} from '../../services/mysteryValidator.js';
import { FALLBACK_MYSTERIES } from '../../services/fallbackLibrary.js';

describe('Mystery Validator & Structural Consistency Rules', () => {
  it('enforces exact configuration counts across all difficulties', () => {
    expect(DIFFICULTY_CONFIG.easy).toEqual({
      name: 'easy',
      suspects: 3,
      clues: 5,
      hints: 2,
      basePoints: 100
    });

    expect(DIFFICULTY_CONFIG.medium).toEqual({
      name: 'medium',
      suspects: 4,
      clues: 7,
      hints: 3,
      basePoints: 150
    });

    expect(DIFFICULTY_CONFIG.hard).toEqual({
      name: 'hard',
      suspects: 5,
      clues: 9,
      hints: 3,
      basePoints: 200
    });
  });

  it('verifies that all curated fallback library templates pass validation', () => {
    for (const diff of VALID_DIFFICULTIES) {
      const templates = FALLBACK_MYSTERIES[diff];
      expect(templates.length).toBeGreaterThan(0);
      for (const template of templates) {
        const result = validateMystery(template, diff);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }
    }
  });

  it('rejects unsupported difficulty strings', () => {
    const validCase = FALLBACK_MYSTERIES.easy[0];
    const result = validateMystery(validCase, 'insane');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/Unsupported difficulty level/);
  });

  it('rejects mystery with incorrect suspect count for specified difficulty', () => {
    const modified = JSON.parse(JSON.stringify(FALLBACK_MYSTERIES.easy[0]));
    modified.suspects.pop();

    const result = validateMystery(modified, 'easy');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Invalid suspects count for easy'))).toBe(true);
  });

  it('rejects mystery with incorrect clues count', () => {
    const modified = JSON.parse(JSON.stringify(FALLBACK_MYSTERIES.medium[0]));
    modified.clues.pop();

    const result = validateMystery(modified, 'medium');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Invalid clues count for medium'))).toBe(true);
  });

  it('rejects mystery with duplicate suspect IDs', () => {
    const modified = JSON.parse(JSON.stringify(FALLBACK_MYSTERIES.easy[0]));
    modified.suspects[1].id = modified.suspects[0].id;

    const result = validateMystery(modified, 'easy');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Duplicate suspect ID'))).toBe(true);
  });

  it('rejects mystery where culpritId does NOT exist in suspects list', () => {
    const modified = JSON.parse(JSON.stringify(FALLBACK_MYSTERIES.medium[0]));
    modified.solution.culpritId = 'ghost_perpetrator';

    const result = validateMystery(modified, 'medium');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Solution references invalid culpritId'))).toBe(true);
  });

  it('rejects mystery where crucialClueIds contains non-existent clue ID', () => {
    const modified = JSON.parse(JSON.stringify(FALLBACK_MYSTERIES.hard[0]));
    modified.solution.crucialClueIds.push('phantom_clue_99');

    const result = validateMystery(modified, 'hard');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('crucialClueIds references non-existent clue ID'))).toBe(true);
  });

  it('rejects mystery with culprit name mismatch against suspect entity', () => {
    const modified = JSON.parse(JSON.stringify(FALLBACK_MYSTERIES.easy[0]));
    modified.solution.culpritName = 'Completely Different Name';

    const result = validateMystery(modified, 'easy');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Culprit name mismatch'))).toBe(true);
  });

  it('rejects mystery with empty crucial clues list', () => {
    const modified = JSON.parse(JSON.stringify(FALLBACK_MYSTERIES.easy[0]));
    modified.solution.crucialClueIds = [];

    const result = validateMystery(modified, 'easy');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('crucial clue'))).toBe(true);
  });

  it('rejects mystery where clues lack spatial location diversity', () => {
    const modified = JSON.parse(JSON.stringify(FALLBACK_MYSTERIES.easy[0]));
    // Set all clues to the exact same room
    modified.clues.forEach(c => { c.location = 'The Basement'; });

    const result = validateMystery(modified, 'easy');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('spatial diversity'))).toBe(true);
  });
});
