import express from 'express';
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

const router = express.Router();

/**
 * GET /api/cases
 * Retrieve list of recent investigations (sanitized)
 */
router.get('/', async (req, res) => {
  try {
    const cases = await getRecentCases(10);
    res.json({ cases });
  } catch (err) {
    console.error('Error fetching cases list:', err);
    res.status(500).json({ error: 'Failed to fetch cases list' });
  }
});

/**
 * POST /api/cases
 * Generate a new mystery case using Gemini AI and persist to DB/Store
 */
router.post('/', async (req, res) => {
  try {
    const { premise, difficulty } = req.body;

    if (!premise || typeof premise !== 'string' || premise.trim().length < 3) {
      return res.status(400).json({ error: 'Premise must be at least 3 characters long' });
    }

    const validDifficulties = ['easy', 'medium', 'hard'];
    const chosenDifficulty = validDifficulties.includes(difficulty?.toLowerCase())
      ? difficulty.toLowerCase()
      : 'medium';

    // Generate mystery case via Gemini or fallback engine
    const mysteryData = await generateMysteryCase(premise.trim(), chosenDifficulty);

    // Persist via resilient CaseStore
    const savedCase = await saveNewCase({
      title: mysteryData.title,
      premise: premise.trim(),
      difficulty: chosenDifficulty,
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
    console.error('Error creating mystery case:', err);
    res.status(500).json({ error: 'Failed to generate mystery case', details: err.message });
  }
});

/**
 * GET /api/cases/:id
 * Retrieve an active case with sanitized data
 */
router.get('/:id', async (req, res) => {
  try {
    const foundCase = await getCaseById(req.params.id);
    if (!foundCase) {
      return res.status(404).json({ error: 'Investigation case file not found' });
    }

    res.json({ case: foundCase });
  } catch (err) {
    console.error('Error fetching case:', err);
    res.status(500).json({ error: 'Failed to retrieve case file' });
  }
});

/**
 * POST /api/cases/:id/clues/:clueId/discover
 * Discover a clue in the crime scene (adds +5 points bonus)
 */
router.post('/:id/clues/:clueId/discover', async (req, res) => {
  try {
    const result = await discoverCaseClue(req.params.id, req.params.clueId);
    if (!result) {
      return res.status(404).json({ error: 'Case or clue not found' });
    }

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      message: 'Clue examined and cataloged into evidence',
      clue: result.clue,
      currentScore: result.currentScore,
      cluesDiscoveredCount: result.cluesDiscoveredCount,
      totalCluesCount: result.totalCluesCount
    });
  } catch (err) {
    console.error('Error discovering clue:', err);
    res.status(500).json({ error: 'Failed to examine clue' });
  }
});

/**
 * POST /api/cases/:id/hints
 * Request and unlock the next forensic hint (-10 points penalty)
 */
router.post('/:id/hints', async (req, res) => {
  try {
    const result = await requestCaseHint(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Case not found' });
    }

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      message: 'Forensic hint declassified',
      hint: result.hint,
      hintsRemaining: result.hintsRemaining,
      currentScore: result.currentScore
    });
  } catch (err) {
    console.error('Error requesting hint:', err);
    res.status(500).json({ error: 'Failed to declassify hint' });
  }
});

/**
 * POST /api/cases/:id/accuse
 * Submit official accusation, calculate final verdict and score, unseal solution
 */
router.post('/:id/accuse', async (req, res) => {
  try {
    const { suspectId, rationale } = req.body;

    if (!suspectId) {
      return res.status(400).json({ error: 'A suspect must be formally accused' });
    }

    const verdict = await submitCaseAccusation(req.params.id, suspectId, rationale);
    if (!verdict) {
      return res.status(404).json({ error: 'Case or suspect not found' });
    }

    if (verdict.error) {
      return res.status(400).json({ error: verdict.error });
    }

    res.json({
      message: verdict.isCorrect ? 'Guilty verdict confirmed! Case closed!' : 'Incorrect accusation! The true culprit escaped!',
      verdict
    });
  } catch (err) {
    console.error('Error submitting accusation:', err);
    res.status(500).json({ error: 'Failed to process accusation' });
  }
});

/**
 * GET /api/cases/:id/result
 * Retrieve full solved case file, solution, and scorecard
 */
router.get('/:id/result', async (req, res) => {
  try {
    const result = await getSolvedCaseResult(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Case not found' });
    }

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (err) {
    console.error('Error retrieving case result:', err);
    res.status(500).json({ error: 'Failed to retrieve case result' });
  }
});

export default router;
