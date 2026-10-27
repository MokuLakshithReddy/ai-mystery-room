import { z } from 'zod';

/**
 * Authoritative Difficulty Configuration
 * Single source of truth across the backend
 */
export const DIFFICULTY_CONFIG = {
  easy: {
    name: 'easy',
    suspects: 3,
    clues: 5,
    hints: 2,
    basePoints: 100
  },
  medium: {
    name: 'medium',
    suspects: 4,
    clues: 7,
    hints: 3,
    basePoints: 150
  },
  hard: {
    name: 'hard',
    suspects: 5,
    clues: 9,
    hints: 3,
    basePoints: 200
  }
};

export const VALID_DIFFICULTIES = Object.keys(DIFFICULTY_CONFIG);

/**
 * Zod Base Schema for Gemini Output
 */
export const SuspectSchema = z.object({
  id: z.string().min(1, 'Suspect ID is required'),
  name: z.string().min(2, 'Suspect name must be at least 2 characters'),
  role: z.string().min(2, 'Suspect role must be at least 2 characters'),
  alibi: z.string().min(5, 'Suspect alibi must be detailed'),
  motive: z.string().min(5, 'Suspect motive must be detailed'),
  relationship: z.string().min(2, 'Suspect relationship is required'),
  demeanor: z.string().min(2, 'Suspect demeanor notes required')
});

export const ClueSchema = z.object({
  id: z.string().min(1, 'Clue ID is required'),
  title: z.string().min(2, 'Clue title must be at least 2 characters'),
  location: z.string().min(2, 'Clue location is required'),
  description: z.string().min(10, 'Clue description must be at least 10 characters')
});

export const HintSchema = z.object({
  id: z.string().min(1, 'Hint ID is required'),
  text: z.string().min(10, 'Hint text must be at least 10 characters')
});

export const SolutionSchema = z.object({
  culpritId: z.string().min(1, 'Culprit ID is required'),
  culpritName: z.string().min(2, 'Culprit name is required'),
  motiveExplanation: z.string().min(15, 'Motive explanation must be at least 15 characters'),
  solutionBreakdown: z.string().min(30, 'Solution breakdown must be at least 30 characters'),
  crucialClueIds: z.array(z.string()).min(1, 'At least one crucial clue ID is required')
});

export const StorySchema = z.object({
  synopsis: z.string().min(25, 'Synopsis must be at least 25 characters'),
  victim: z.string().min(2, 'Victim name must be at least 2 characters'),
  crimeScene: z.string().min(3, 'Crime scene must be at least 3 characters'),
  crimeType: z.string().min(3, 'Crime type must be at least 3 characters'),
  timeOfCrime: z.string().min(2, 'Time of crime is required')
});

export const RawMysterySchema = z.object({
  title: z.string().min(3, 'Mystery title must be at least 3 characters'),
  story: StorySchema,
  suspects: z.array(SuspectSchema),
  clues: z.array(ClueSchema),
  hints: z.array(HintSchema),
  solution: SolutionSchema
});

/**
 * Comprehensive Logical Consistency & Reference Validation
 * Validates counts, uniqueness, cross-references, and causal consistency.
 *
 * @param {object} mystery - The parsed mystery object
 * @param {string} difficulty - 'easy' | 'medium' | 'hard'
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateMystery(mystery, difficulty) {
  const errors = [];

  const normalizedDiff = (difficulty || '').toLowerCase().trim();
  const config = DIFFICULTY_CONFIG[normalizedDiff];

  if (!config) {
    return {
      valid: false,
      errors: [`Unsupported difficulty level: "${difficulty}". Must be one of: easy, medium, hard.`]
    };
  }

  // 1. Structural schema validation via Zod
  const parseResult = RawMysterySchema.safeParse(mystery);
  if (!parseResult.success) {
    for (const issue of parseResult.error.issues) {
      errors.push(`Schema Error [${issue.path.join('.')}]: ${issue.message}`);
    }
    return { valid: false, errors };
  }

  const data = parseResult.data;

  // 2. Strict exact count enforcement based on difficulty
  if (data.suspects.length !== config.suspects) {
    errors.push(
      `Invalid suspects count for ${config.name} difficulty: expected ${config.suspects}, got ${data.suspects.length}`
    );
  }

  if (data.clues.length !== config.clues) {
    errors.push(
      `Invalid clues count for ${config.name} difficulty: expected ${config.clues}, got ${data.clues.length}`
    );
  }

  if (data.hints.length !== config.hints) {
    errors.push(
      `Invalid hints count for ${config.name} difficulty: expected ${config.hints}, got ${data.hints.length}`
    );
  }

  // 3. Unique IDs check
  const suspectIds = new Set();
  data.suspects.forEach((s, idx) => {
    if (suspectIds.has(s.id)) {
      errors.push(`Duplicate suspect ID detected: "${s.id}" at index ${idx}`);
    }
    suspectIds.add(s.id);
  });

  const clueIds = new Set();
  data.clues.forEach((c, idx) => {
    if (clueIds.has(c.id)) {
      errors.push(`Duplicate clue ID detected: "${c.id}" at index ${idx}`);
    }
    clueIds.add(c.id);
  });

  const hintIds = new Set();
  data.hints.forEach((h, idx) => {
    if (hintIds.has(h.id)) {
      errors.push(`Duplicate hint ID detected: "${h.id}" at index ${idx}`);
    }
    hintIds.add(h.id);
  });

  // 4. Culprit cross-reference check
  // CRITICAL: Culprit must exist in suspects. Never silently rewrite!
  const culpritSuspect = data.suspects.find(s => s.id === data.solution.culpritId);
  if (!culpritSuspect) {
    errors.push(
      `Solution references invalid culpritId "${data.solution.culpritId}" which is not in the suspects list.`
    );
  } else {
    // Check culprit name alignment
    if (!culpritSuspect.name.toLowerCase().includes(data.solution.culpritName.toLowerCase()) &&
        !data.solution.culpritName.toLowerCase().includes(culpritSuspect.name.toLowerCase())) {
      errors.push(
        `Culprit name mismatch: solution states "${data.solution.culpritName}" but suspect ID "${data.solution.culpritId}" is named "${culpritSuspect.name}".`
      );
    }
  }

  // 5. Crucial clues reference check
  // All crucial clues must exist in the clues array
  data.solution.crucialClueIds.forEach((crucialId) => {
    if (!clueIds.has(crucialId)) {
      errors.push(
        `Solution crucialClueIds references non-existent clue ID "${crucialId}".`
      );
    }
  });

  // 6. Logical consistency checks
  // A. Check that the crime scene narrative defines who the victim is
  if (!data.story.victim || data.story.victim.trim().length < 2) {
    errors.push('Crime story missing valid victim name.');
  }

  // B. Ensure all clues have unique non-empty locations
  const clueLocations = data.clues.map(c => c.location.toLowerCase().trim());
  const uniqueLocations = new Set(clueLocations);
  if (uniqueLocations.size < Math.floor(data.clues.length * 0.7)) {
    errors.push('Clues lack spatial diversity across the crime scene.');
  }

  // C. Solution breakdown must not be trivial
  if (data.solution.solutionBreakdown.length < 50) {
    errors.push('Solution breakdown is too brief to provide a fair-play proof trail.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
