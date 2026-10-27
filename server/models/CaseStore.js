import mongoose from 'mongoose';
import { Case } from './Case.js';

// Disable buffering so calls don't hang if MongoDB is disconnected
mongoose.set('bufferCommands', false);

// In-memory cache for fast local lookup
const inMemoryCases = new Map();

// Cloud persistence credentials for serverless Vercel persistence
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

export const DIFFICULTY_BASE_POINTS = {
  easy: 100,
  medium: 150,
  hard: 200
};

function isMongoConnected() {
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

export function sanitizeCaseForClient(caseObj) {
  const cloned = JSON.parse(JSON.stringify(caseObj));

  // Strip solution if not completed
  if (cloned.status !== 'completed') {
    delete cloned.solution;
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
 * Save new case
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

  // Try Mongo first if connected
  if (isMongoConnected()) {
    try {
      const doc = new Case(caseData);
      await doc.save();
    } catch (err) {
      console.warn('MongoDB save failed:', err.message);
    }
  }

  // Persist to Cloud Store & Memory cache
  inMemoryCases.set(id, caseData);
  await cloudUpsertCase(id, caseData);

  return sanitizeCaseForClient(caseData);
}

/**
 * Find raw internal case by ID
 */
async function getRawCase(id) {
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
        return cases.map(c => c.toClientJSON());
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
 * Discover a clue
 */
export async function discoverCaseClue(caseId, clueId) {
  const caseData = await getRawCase(caseId);
  if (!caseData) return null;
  if (caseData.status === 'completed') return { error: 'Case already completed' };

  const clue = caseData.clues.find(c => c.id === clueId);
  if (!clue) return null;

  if (!clue.isDiscovered) {
    clue.isDiscovered = true;
    clue.discoveredAt = new Date();
    caseData.score.clueBonus += 5;
    caseData.score.totalScore = Math.max(0, caseData.score.basePoints + caseData.score.clueBonus - caseData.score.hintPenalty);

    // Save updates to Mongo if connected
    if (isMongoConnected()) {
      try {
        await Case.updateOne(
          { _id: caseId, 'clues.id': clueId },
          { 
            $set: { 
              'clues.$.isDiscovered': true, 
              'clues.$.discoveredAt': clue.discoveredAt,
              'score.clueBonus': caseData.score.clueBonus,
              'score.totalScore': caseData.score.totalScore
            } 
          }
        );
      } catch (err) {
        console.warn('MongoDB clue update failed:', err.message);
      }
    }

    // Save updates to cloud store and cache
    inMemoryCases.set(caseId, caseData);
    await cloudUpsertCase(caseId, caseData);
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
}

/**
 * Request a hint
 */
export async function requestCaseHint(caseId) {
  const caseData = await getRawCase(caseId);
  if (!caseData) return null;
  if (caseData.status === 'completed') return { error: 'Case already completed' };

  const nextHint = caseData.hints.find(h => !h.isUnlocked);
  if (!nextHint) return { error: 'All hints declassified' };

  nextHint.isUnlocked = true;
  nextHint.unlockedAt = new Date();
  caseData.score.hintPenalty += 10;
  caseData.score.totalScore = Math.max(0, caseData.score.basePoints + caseData.score.clueBonus - caseData.score.hintPenalty);

  // Update Mongo if connected
  if (isMongoConnected()) {
    try {
      await Case.updateOne(
        { _id: caseId, 'hints.id': nextHint.id },
        { 
          $set: { 
            'hints.$.isUnlocked': true, 
            'hints.$.unlockedAt': nextHint.unlockedAt,
            'score.hintPenalty': caseData.score.hintPenalty,
            'score.totalScore': caseData.score.totalScore
          } 
        }
      );
    } catch (err) {
      console.warn('MongoDB hint update failed:', err.message);
    }
  }

  // Update cloud store and cache
  inMemoryCases.set(caseId, caseData);
  await cloudUpsertCase(caseId, caseData);

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
}

/**
 * Submit accusation
 */
export async function submitCaseAccusation(caseId, suspectId, rationale) {
  const caseData = await getRawCase(caseId);
  if (!caseData) return null;
  if (caseData.status === 'completed') return { error: 'Case already completed' };

  const suspect = caseData.suspects.find(s => s.id === suspectId);
  if (!suspect) return null;

  const isCorrect = suspectId === caseData.solution.culpritId;
  const basePoints = isCorrect ? (DIFFICULTY_BASE_POINTS[caseData.difficulty] || 150) : 0;
  const discoveredCluesCount = caseData.clues.filter(c => c.isDiscovered).length;
  const clueBonus = discoveredCluesCount * 5;
  const unlockedHintsCount = caseData.hints.filter(h => h.isUnlocked).length;
  const hintPenalty = unlockedHintsCount * 10;
  const totalScore = Math.max(0, basePoints + clueBonus - hintPenalty);

  caseData.status = 'completed';
  caseData.completedAt = new Date();
  caseData.playerAccusation = {
    accusedSuspectId: suspectId,
    rationale: rationale || '',
    submittedAt: new Date(),
    isCorrect
  };
  caseData.score = {
    basePoints,
    clueBonus,
    hintPenalty,
    totalScore
  };

  // Update Mongo if connected
  if (isMongoConnected()) {
    try {
      await Case.updateOne(
        { _id: caseId },
        { 
          $set: { 
            status: 'completed',
            completedAt: caseData.completedAt,
            playerAccusation: caseData.playerAccusation,
            score: caseData.score
          } 
        }
      );
    } catch (err) {
      console.warn('MongoDB accusation update failed:', err.message);
    }
  }

  // Update cloud store and cache
  inMemoryCases.set(caseId, caseData);
  await cloudUpsertCase(caseId, caseData);

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
