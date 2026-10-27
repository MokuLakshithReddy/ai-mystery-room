import mongoose from 'mongoose';
import { Case } from './Case.js';

// Disable buffering so calls fail fast if MongoDB is disconnected
mongoose.set('bufferCommands', false);

// In-memory cache for fast local lookup and read caching
const inMemoryCases = new Map();

// Concurrency mutex per caseId to serialize process-local operations
const caseLocks = new Map();

/**
 * Execute an async function with an exclusive lock for the given case ID
 */
export async function withCaseLock(caseId, fn) {
  const previous = caseLocks.get(caseId) || Promise.resolve();
  let release;
  const current = new Promise(resolve => { release = resolve; });
  caseLocks.set(caseId, current);

  try {
    await previous;
    return await fn();
  } finally {
    release();
    if (caseLocks.get(caseId) === current) {
      caseLocks.delete(caseId);
    }
  }
}

// Cloud persistence credentials for serverless Vercel persistence
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

export const DIFFICULTY_BASE_POINTS = {
  easy: 100,
  medium: 150,
  hard: 200
};

/**
 * Authoritative production score calculation
 * Formula: max(0, basePoints + (discoveredClues * 5) - (unlockedHints * 10))
 */
export function calculateScore({ difficulty, isCorrect, discoveredCluesCount = 0, unlockedHintsCount = 0 }) {
  const normalizedDiff = (difficulty || 'easy').toLowerCase().trim();
  const basePoints = isCorrect ? (DIFFICULTY_BASE_POINTS[normalizedDiff] || 0) : 0;
  const clueBonus = Math.max(0, discoveredCluesCount) * 5;
  const hintPenalty = Math.max(0, unlockedHintsCount) * 10;
  const totalScore = Math.max(0, basePoints + clueBonus - hintPenalty);

  return {
    basePoints,
    clueBonus,
    hintPenalty,
    totalScore
  };
}

export function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

// Cloud persistence helpers using native fetch
async function cloudUpsertCase(id, caseData) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/ai_mystery_cases`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({ id, data: caseData })
    });
    return res.ok;
  } catch (err) {
    console.warn('Cloud upsert failed:', err.message);
    return false;
  }
}

async function cloudGetCase(id) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/ai_mystery_cases?id=eq.${id}&select=data`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    if (!res.ok) return null;
    const records = await res.json();
    return records && records.length > 0 ? records[0].data : null;
  } catch (err) {
    console.warn('Cloud get failed:', err.message);
    return null;
  }
}

async function cloudListCases(limit = 10) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/ai_mystery_cases?select=data&order=created_at.desc&limit=${limit}`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    if (!res.ok) return [];
    const records = await res.json();
    return (records || []).map(r => r.data);
  } catch (err) {
    console.warn('Cloud list failed:', err.message);
    return [];
  }
}

/**
 * Enforce durable persistence to MongoDB Atlas or Cloud Store
 * Throws DURABLE_PERSISTENCE_FAILED if neither succeeded.
 */
async function persistDurable(id, caseData, isNew = false) {
  let persisted = false;

  // 1. Try MongoDB if connected
  if (isMongoConnected()) {
    try {
      if (isNew) {
        const doc = new Case(caseData);
        await doc.save();
      } else {
        await Case.replaceOne({ _id: id }, caseData, { upsert: true });
      }
      persisted = true;
    } catch (err) {
      console.warn('MongoDB durable persist error:', err.message);
    }
  }

  // 2. Try Supabase Cloud Store
  if (SUPABASE_URL && SUPABASE_KEY) {
    const cloudOk = await cloudUpsertCase(id, caseData);
    if (cloudOk) {
      persisted = true;
    }
  }

  // 3. Testing-only override (explicitly configured for isolated mocks)
  if (!persisted && process.env.ALLOW_IN_MEMORY_FOR_TESTS === 'true') {
    persisted = true;
  }

  if (!persisted) {
    throw new Error('DURABLE_PERSISTENCE_FAILED: Unable to commit case to durable storage');
  }

  // Update memory cache on successful durable write
  inMemoryCases.set(id, caseData);
  return true;
}

export function sanitizeCaseForClient(caseObj) {
  if (!caseObj) return null;
  const cloned = JSON.parse(JSON.stringify(caseObj));

  // Strip solution if case is active
  if (cloned.status !== 'completed') {
    delete cloned.solution;
    delete cloned.culprit;
    delete cloned.playerAccusation;
  }

  // Hide clue details if undiscovered
  if (cloned.clues) {
    cloned.clues = cloned.clues.map(c => {
      if (!c.isDiscovered) {
        return {
          id: c.id,
          title: `${c.location} - Unexamined Area`,
          location: c.location,
          isDiscovered: false
        };
      }
      return c;
    });
  }

  // Hide hint text if locked
  if (cloned.hints) {
    cloned.hints = cloned.hints.map((h, index) => {
      if (!h.isUnlocked) {
        return {
          id: h.id,
          title: `Forensic Hint #${index + 1}`,
          isUnlocked: false
        };
      }
      return h;
    });
  }

  return cloned;
}

/**
 * Save new case with guaranteed durable persistence
 */
export async function saveNewCase(casePayload) {
  const id = new mongoose.Types.ObjectId().toString();
  const caseData = {
    _id: id,
    title: casePayload.title,
    premise: casePayload.premise,
    difficulty: casePayload.difficulty,
    story: casePayload.story,
    suspects: casePayload.suspects,
    clues: casePayload.clues.map(c => ({
      ...c,
      isDiscovered: false
    })),
    hints: casePayload.hints.map(h => ({
      ...h,
      isUnlocked: false
    })),
    solution: casePayload.solution,
    status: 'active',
    score: {
      basePoints: 0,
      clueBonus: 0,
      hintPenalty: 0,
      totalScore: 0
    },
    createdAt: new Date()
  };

  await persistDurable(id, caseData, true);
  return sanitizeCaseForClient(caseData);
}

/**
 * Find raw internal case by ID
 */
export async function getRawCase(id) {
  // Check memory cache first
  if (inMemoryCases.has(id)) {
    return inMemoryCases.get(id);
  }

  // Check Mongo
  if (isMongoConnected()) {
    try {
      const found = await Case.findById(id).select('+solution');
      if (found) {
        const obj = found.toObject();
        inMemoryCases.set(id, obj);
        return obj;
      }
    } catch (err) {
      console.warn('MongoDB query failed:', err.message);
    }
  }

  // Check Cloud Store
  const cloudData = await cloudGetCase(id);
  if (cloudData) {
    inMemoryCases.set(id, cloudData);
    return cloudData;
  }

  return null;
}

/**
 * Find case by ID for client
 */
export async function getCaseById(id) {
  const raw = await getRawCase(id);
  if (!raw) return null;
  return sanitizeCaseForClient(raw);
}

/**
 * List recent cases
 */
export async function getRecentCases(limit = 10) {
  if (isMongoConnected()) {
    try {
      const cases = await Case.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('-solution');
      if (cases && cases.length > 0) {
        return cases.map(c => c.toClientJSON ? c.toClientJSON() : sanitizeCaseForClient(c));
      }
    } catch (err) {
      console.warn('MongoDB list failed:', err.message);
    }
  }

  // Check Cloud Store
  const cloudList = await cloudListCases(limit);
  if (cloudList && cloudList.length > 0) {
    return cloudList.map(c => sanitizeCaseForClient(c));
  }

  // Fallback to local memory cache
  return Array.from(inMemoryCases.values())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
    .map(c => sanitizeCaseForClient(c));
}

/**
 * Discover a clue - atomic and idempotent
 */
export async function discoverCaseClue(caseId, clueId) {
  return withCaseLock(caseId, async () => {
    const caseData = await getRawCase(caseId);
    if (!caseData) return null;
    if (caseData.status === 'completed') return { error: 'Case already completed' };

    const clue = caseData.clues.find(c => c.id === clueId);
    if (!clue) return null;

    // Idempotent: If already discovered, do not award duplicate points
    if (!clue.isDiscovered) {
      clue.isDiscovered = true;
      clue.discoveredAt = new Date();

      const discoveredCount = caseData.clues.filter(c => c.isDiscovered).length;
      const hintsUsedCount = caseData.hints.filter(h => h.isUnlocked).length;
      const newScore = calculateScore({
        difficulty: caseData.difficulty,
        isCorrect: false,
        discoveredCluesCount: discoveredCount,
        unlockedHintsCount: hintsUsedCount
      });

      caseData.score = newScore;
      await persistDurable(caseId, caseData, false);
    }

    return {
      clue: {
        id: clue.id,
        title: clue.title,
        location: clue.location,
        description: clue.description,
        isDiscovered: true,
        discoveredAt: clue.discoveredAt
      },
      currentScore: caseData.score.totalScore,
      cluesDiscoveredCount: caseData.clues.filter(c => c.isDiscovered).length,
      totalCluesCount: caseData.clues.length
    };
  });
}

/**
 * Request a hint - atomic progression
 */
export async function requestCaseHint(caseId) {
  return withCaseLock(caseId, async () => {
    const caseData = await getRawCase(caseId);
    if (!caseData) return null;
    if (caseData.status === 'completed') return { error: 'Case already completed' };

    const nextHint = caseData.hints.find(h => !h.isUnlocked);
    if (!nextHint) return { error: 'All hints declassified' };

    nextHint.isUnlocked = true;
    nextHint.unlockedAt = new Date();

    const discoveredCount = caseData.clues.filter(c => c.isDiscovered).length;
    const hintsUsedCount = caseData.hints.filter(h => h.isUnlocked).length;
    const newScore = calculateScore({
      difficulty: caseData.difficulty,
      isCorrect: false,
      discoveredCluesCount: discoveredCount,
      unlockedHintsCount: hintsUsedCount
    });

    caseData.score = newScore;
    await persistDurable(caseId, caseData, false);

    return {
      hint: {
        id: nextHint.id,
        text: nextHint.text,
        isUnlocked: true,
        unlockedAt: nextHint.unlockedAt
      },
      hintsRemaining: caseData.hints.filter(h => !h.isUnlocked).length,
      currentScore: caseData.score.totalScore
    };
  });
}

/**
 * Submit accusation - database-level atomic conditional transition
 * Guarantees that only ONE accusation can transition a case from active to completed.
 */
export async function submitCaseAccusation(caseId, suspectId, rationale) {
  return withCaseLock(caseId, async () => {
    const caseData = await getRawCase(caseId);
    if (!caseData) return null;
    if (caseData.status === 'completed') return { error: 'Case already completed' };

    const suspect = caseData.suspects.find(s => s.id === suspectId);
    if (!suspect) return null;

    const isCorrect = suspectId === caseData.solution.culpritId;
    const discoveredCluesCount = caseData.clues.filter(c => c.isDiscovered).length;
    const unlockedHintsCount = caseData.hints.filter(h => h.isUnlocked).length;

    const finalScoreObj = calculateScore({
      difficulty: caseData.difficulty,
      isCorrect,
      discoveredCluesCount,
      unlockedHintsCount
    });

    // Database-level conditional transition if Mongo is ready
    if (isMongoConnected()) {
      try {
        const updatedDoc = await Case.findOneAndUpdate(
          { _id: caseId, status: 'active' },
          {
            $set: {
              status: 'completed',
              completedAt: new Date(),
              playerAccusation: {
                accusedSuspectId: suspectId,
                rationale: rationale || '',
                submittedAt: new Date(),
                isCorrect
              },
              score: finalScoreObj
            }
          },
          { returnDocument: 'after' }
        ).select('+solution');

        if (!updatedDoc) {
          return { error: 'Case already completed' };
        }

        const rawObj = updatedDoc.toObject();
        inMemoryCases.set(caseId, rawObj);
        await cloudUpsertCase(caseId, rawObj);

        return {
          isCorrect,
          accusedSuspect: {
            id: suspect.id,
            name: suspect.name,
            role: suspect.role
          },
          culprit: {
            id: rawObj.solution.culpritId,
            name: rawObj.solution.culpritName,
          },
          motiveExplanation: rawObj.solution.motiveExplanation,
          solutionBreakdown: rawObj.solution.solutionBreakdown,
          crucialClueIds: rawObj.solution.crucialClueIds,
          score: rawObj.score
        };
      } catch (err) {
        console.warn('MongoDB atomic accusation error:', err.message);
      }
    }

    // Cloud / In-memory fallback
    caseData.status = 'completed';
    caseData.completedAt = new Date();
    caseData.playerAccusation = {
      accusedSuspectId: suspectId,
      rationale: rationale || '',
      submittedAt: new Date(),
      isCorrect
    };
    caseData.score = finalScoreObj;

    await persistDurable(caseId, caseData, false);

    return {
      isCorrect,
      accusedSuspect: {
        id: suspect.id,
        name: suspect.name,
        role: suspect.role
      },
      culprit: {
        id: caseData.solution.culpritId,
        name: caseData.solution.culpritName,
      },
      motiveExplanation: caseData.solution.motiveExplanation,
      solutionBreakdown: caseData.solution.solutionBreakdown,
      crucialClueIds: caseData.solution.crucialClueIds,
      score: caseData.score
    };
  });
}

/**
 * Get solved case result
 */
export async function getSolvedCaseResult(caseId) {
  const caseData = await getRawCase(caseId);
  if (!caseData) return null;
  if (caseData.status !== 'completed') return { error: 'Case still active' };

  const accusedSuspect = caseData.suspects?.find(s => s.id === caseData.playerAccusation?.accusedSuspectId);

  return {
    case: caseData,
    verdict: {
      isCorrect: caseData.playerAccusation?.isCorrect,
      accusedSuspectId: caseData.playerAccusation?.accusedSuspectId,
      accusedSuspect: accusedSuspect ? {
        id: accusedSuspect.id,
        name: accusedSuspect.name,
        role: accusedSuspect.role
      } : null,
      culprit: {
        id: caseData.solution.culpritId,
        name: caseData.solution.culpritName
      },
      motiveExplanation: caseData.solution.motiveExplanation,
      solutionBreakdown: caseData.solution.solutionBreakdown,
      crucialClueIds: caseData.solution.crucialClueIds,
      score: caseData.score
    }
  };
}
