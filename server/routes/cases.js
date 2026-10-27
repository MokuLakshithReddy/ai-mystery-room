import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { 
  saveNewCase, 
  getCaseById, 
  getRecentCases, 
  discoverCaseClue, 
  requestCaseHint, 
  submitCaseAccusation, 
  getSolvedCaseResult 
} from '../models/CaseStore.js';
import { generateMysteryCase } from '../services/gemini.js';
import { VALID_DIFFICULTIES } from '../services/mysteryValidator.js';

const router = express.Router();

// Specific rate limiter for expensive AI case generation (skip in test environment)
const createCaseLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30, // 30 mystery generations per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    error: 'Mystery generation rate limit reached. Please wait before creating another case.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

/**
 * GET /api/cases
 * Retrieve list of recent investigations (sanitized)
 */
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const cases = await getRecentCases(limit);
    res.json({ cases });
  } catch (err) {
    console.error('Error fetching cases list:', err.message);
    res.status(500).json({ 
      error: 'Failed to fetch cases list',
      code: 'CASES_LIST_FAILED'
    });
  }
});

/**
 * POST /api/cases
 * Generate a new mystery case using Gemini AI and persist to DB/Store
 * Validates premise (5-300 characters) and difficulty (easy, medium, hard)
 */
router.post('/', createCaseLimiter, async (req, res) => {
  try {
    const { premise, difficulty } = req.body || {};

    // 1. Premise validation
    if (typeof premise !== 'string') {
      return res.status(400).json({ 
        error: 'Premise must be a valid text string.',
        code: 'INVALID_PREMISE_TYPE'
      });
    }

    const trimmedPremise = premise.trim();
    if (trimmedPremise.length < 5) {
      return res.status(400).json({ 
        error: 'Premise is too short. Must be at least 5 characters long.',
        code: 'PREMISE_TOO_SHORT'
      });
    }

    if (trimmedPremise.length > 300) {
      return res.status(400).json({ 
        error: 'Premise is too long. Must not exceed 300 characters.',
        code: 'PREMISE_TOO_LONG'
      });
    }

    // 2. Difficulty validation
    if (typeof difficulty !== 'string') {
      return res.status(400).json({ 
        error: `Difficulty is required and must be one of: ${VALID_DIFFICULTIES.join(', ')}.`,
        code: 'MISSING_DIFFICULTY'
      });
    }

    const normalizedDifficulty = difficulty.toLowerCase().trim();
    if (!VALID_DIFFICULTIES.includes(normalizedDifficulty)) {
      return res.status(400).json({ 
        error: `Invalid difficulty "${difficulty}". Supported values are: ${VALID_DIFFICULTIES.join(', ')}.`,
        code: 'INVALID_DIFFICULTY'
      });
    }

    // 3. Generate mystery case via Gemini or certified fallback engine
    const mysteryData = await generateMysteryCase(trimmedPremise, normalizedDifficulty);

    // 4. Persist via authoritative CaseStore
    const savedCase = await saveNewCase({
      title: mysteryData.title,
      premise: trimmedPremise,
      difficulty: normalizedDifficulty,
      story: mysteryData.story,
      suspects: mysteryData.suspects,
      clues: mysteryData.clues,
      hints: mysteryData.hints,
      solution: mysteryData.solution
    });

    res.status(201).json({
      message: 'Mystery case generated successfully',
      case: savedCase
    });
  } catch (err) {
    console.error('Error creating mystery case:', err.message);

    if (err.message && err.message.includes('DURABLE_PERSISTENCE_FAILED')) {
      return res.status(503).json({ 
        error: 'Persistent storage unavailable. The mystery case could not be durably saved.',
        code: 'PERSISTENCE_UNAVAILABLE'
      });
    }

    res.status(500).json({ 
      error: 'Failed to generate mystery case. Please try again.',
      code: 'CASE_CREATION_FAILED'
    });
  }
});

/**
 * GET /api/cases/:id
 * Retrieve an active case with sanitized data (no solution, unrevealed clue details hidden)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ 
        error: 'Valid Case ID parameter is required',
        code: 'INVALID_CASE_ID'
      });
    }

    const foundCase = await getCaseById(id);
    if (!foundCase) {
      return res.status(404).json({ 
        error: 'Investigation case file not found',
        code: 'CASE_NOT_FOUND'
      });
    }

    res.json({ case: foundCase });
  } catch (err) {
    console.error('Error fetching case:', err.message);
    res.status(500).json({ 
      error: 'Failed to retrieve case file',
      code: 'CASE_FETCH_FAILED'
    });
  }
});

/**
 * POST /api/cases/:id/clues/:clueId/discover
 * Discover a clue in the crime scene (adds +5 points bonus idempotently)
 */
router.post('/:id/clues/:clueId/discover', async (req, res) => {
  try {
    const { id, clueId } = req.params;
    if (!id || !clueId) {
      return res.status(400).json({ 
        error: 'Both case ID and clue ID are required',
        code: 'MISSING_PARAMETERS'
      });
    }

    const result = await discoverCaseClue(id, clueId);
    if (!result) {
      return res.status(404).json({ 
        error: 'Case or clue not found',
        code: 'CLUE_NOT_FOUND'
      });
    }

    if (result.error) {
      return res.status(400).json({ 
        error: result.error,
        code: result.error === 'Case already completed' ? 'CASE_ALREADY_COMPLETED' : 'CLUE_DISCOVERY_ERROR'
      });
    }

    res.json({
      message: 'Clue examined and cataloged into evidence',
      clue: result.clue,
      currentScore: result.currentScore,
      cluesDiscoveredCount: result.cluesDiscoveredCount,
      totalCluesCount: result.totalCluesCount
    });
  } catch (err) {
    console.error('Error discovering clue:', err.message);
    if (err.message && err.message.includes('DURABLE_PERSISTENCE_FAILED')) {
      return res.status(503).json({
        error: 'Storage unavailable. Clue discovery could not be durably recorded.',
        code: 'PERSISTENCE_UNAVAILABLE'
      });
    }
    res.status(500).json({ 
      error: 'Failed to examine clue',
      code: 'CLUE_EXAMINE_FAILED'
    });
  }
});

/**
 * POST /api/cases/:id/hints
 * Request and unlock the next forensic hint (-10 points penalty)
 */
router.post('/:id/hints', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ 
        error: 'Case ID parameter is required',
        code: 'MISSING_CASE_ID'
      });
    }

    const result = await requestCaseHint(id);
    if (!result) {
      return res.status(404).json({ 
        error: 'Case not found',
        code: 'CASE_NOT_FOUND'
      });
    }

    if (result.error) {
      const code = result.error === 'All hints declassified' ? 'ALL_HINTS_USED' :
                   result.error === 'Case already completed' ? 'CASE_ALREADY_COMPLETED' : 'HINT_ERROR';
      return res.status(400).json({ 
        error: result.error,
        code
      });
    }

    res.json({
      message: 'Forensic hint declassified',
      hint: result.hint,
      hintsRemaining: result.hintsRemaining,
      currentScore: result.currentScore
    });
  } catch (err) {
    console.error('Error requesting hint:', err.message);
    if (err.message && err.message.includes('DURABLE_PERSISTENCE_FAILED')) {
      return res.status(503).json({
        error: 'Storage unavailable. Hint usage could not be durably recorded.',
        code: 'PERSISTENCE_UNAVAILABLE'
      });
    }
    res.status(500).json({ 
      error: 'Failed to declassify hint',
      code: 'HINT_REQUEST_FAILED'
    });
  }
});

/**
 * POST /api/cases/:id/accuse
 * Submit official accusation, calculate final verdict and score, unseal solution
 */
router.post('/:id/accuse', async (req, res) => {
  try {
    const { id } = req.params;
    const { suspectId, rationale } = req.body || {};

    if (!id) {
      return res.status(400).json({ 
        error: 'Case ID is required',
        code: 'MISSING_CASE_ID'
      });
    }

    if (!suspectId || typeof suspectId !== 'string') {
      return res.status(400).json({ 
        error: 'A valid suspect must be formally accused',
        code: 'INVALID_SUSPECT_ID'
      });
    }

    const verdict = await submitCaseAccusation(id, suspectId.trim(), typeof rationale === 'string' ? rationale.trim() : '');
    if (!verdict) {
      return res.status(404).json({ 
        error: 'Case or suspect not found',
        code: 'RESOURCE_NOT_FOUND'
      });
    }

    if (verdict.error) {
      return res.status(400).json({ 
        error: verdict.error,
        code: verdict.error === 'Case already completed' ? 'CASE_ALREADY_COMPLETED' : 'ACCUSATION_ERROR'
      });
    }

    res.json({
      message: verdict.isCorrect ? 'Guilty verdict confirmed! Case closed!' : 'Incorrect accusation! The true culprit escaped!',
      verdict
    });
  } catch (err) {
    console.error('Error submitting accusation:', err.message);
    if (err.message && err.message.includes('DURABLE_PERSISTENCE_FAILED')) {
      return res.status(503).json({
        error: 'Storage unavailable. Accusation verdict could not be durably recorded.',
        code: 'PERSISTENCE_UNAVAILABLE'
      });
    }
    res.status(500).json({ 
      error: 'Failed to process accusation',
      code: 'ACCUSATION_PROCESSING_FAILED'
    });
  }
});

/**
 * GET /api/cases/:id/result
 * Retrieve full solved case file, solution, and scorecard
 */
router.get('/:id/result', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ 
        error: 'Case ID parameter is required',
        code: 'MISSING_CASE_ID'
      });
    }

    const result = await getSolvedCaseResult(id);
    if (!result) {
      return res.status(404).json({ 
        error: 'Case not found',
        code: 'CASE_NOT_FOUND'
      });
    }

    if (result.error) {
      return res.status(400).json({ 
        error: result.error,
        code: result.error === 'Case still active' ? 'CASE_STILL_ACTIVE' : 'RESULT_ERROR'
      });
    }

    res.json(result);
  } catch (err) {
    console.error('Error retrieving case result:', err.message);
    res.status(500).json({ 
      error: 'Failed to retrieve case result',
      code: 'RESULT_FETCH_FAILED'
    });
  }
});

export default router;
