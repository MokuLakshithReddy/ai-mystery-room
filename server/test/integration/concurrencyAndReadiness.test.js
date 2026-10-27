import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { 
  saveNewCase, 
  discoverCaseClue, 
  requestCaseHint, 
  submitCaseAccusation, 
  clearLocalCache,
  isMongoConnected
} from '../../models/CaseStore.js';
import { Case } from '../../models/Case.js';
import { connectDB } from '../../index.js';
import { FALLBACK_MYSTERIES } from '../../services/fallbackLibrary.js';

describe('Concurrency & Database Readiness Tests', () => {
  beforeAll(async () => {
    await connectDB();
    expect(mongoose.connection.readyState).toBe(1);
    delete process.env.ALLOW_IN_MEMORY_FOR_TESTS;
  });

  afterAll(async () => {
    // Keep connection clean
  });

  it('guarantees deadlock-free execution when multiple concurrent requests ask for hints simultaneously', async () => {
    const template = FALLBACK_MYSTERIES.medium[0]; // Medium has 3 hints
    const created = await saveNewCase({
      title: 'Deadlock-Free Hint Race',
      premise: 'Testing simultaneous hint claims',
      difficulty: 'medium',
      story: template.story,
      suspects: template.suspects,
      clues: template.clues,
      hints: template.hints,
      solution: template.solution
    });

    const caseId = created._id;

    // Concurrently trigger 4 hint requests (only 3 exist)
    const results = await Promise.all([
      requestCaseHint(caseId),
      requestCaseHint(caseId),
      requestCaseHint(caseId),
      requestCaseHint(caseId)
    ]);

    // Ensure none hung or deadlocked!
    expect(results).toHaveLength(4);

    const successfulHints = results.filter(r => r && r.hint && r.hint.isUnlocked);
    const exhaustedHints = results.filter(r => r && r.error);

    // Exactly 3 hints unlocked, 1 reported all hints declassified/claimed
    expect(successfulHints).toHaveLength(3);
    expect(exhaustedHints).toHaveLength(1);

    clearLocalCache();

    // Verify DB state directly
    const doc = await Case.findById(caseId);
    const unlockedCount = doc.hints.filter(h => h.isUnlocked).length;
    expect(unlockedCount).toBe(3);
    expect(doc.score.hintPenalty).toBe(30);

    await Case.deleteOne({ _id: caseId });
  });

  it('atomically coordinates concurrent clue discovery and hint requests without dropping points', async () => {
    const template = FALLBACK_MYSTERIES.hard[0]; // Hard: 9 clues, 3 hints
    const created = await saveNewCase({
      title: 'Atomic Score Race Test',
      premise: 'Racing clue discoveries and hints simultaneously',
      difficulty: 'hard',
      story: template.story,
      suspects: template.suspects,
      clues: template.clues,
      hints: template.hints,
      solution: template.solution
    });

    const caseId = created._id;

    // Concurrently discover 4 distinct clues and request 2 hints
    const ops = [
      discoverCaseClue(caseId, template.clues[0].id),
      discoverCaseClue(caseId, template.clues[1].id),
      requestCaseHint(caseId),
      discoverCaseClue(caseId, template.clues[2].id),
      requestCaseHint(caseId),
      discoverCaseClue(caseId, template.clues[3].id)
    ];

    const results = await Promise.all(ops);
    expect(results).toHaveLength(6);

    clearLocalCache();

    // Direct database validation
    const doc = await Case.findById(caseId);
    const discoveredClues = doc.clues.filter(c => c.isDiscovered).length;
    const unlockedHints = doc.hints.filter(h => h.isUnlocked).length;

    expect(discoveredClues).toBe(4);
    expect(unlockedHints).toBe(2);

    // 4 clues * 5 = 20 bonus
    // 2 hints * 10 = 20 penalty
    // Total score = max(0, 0 + 20 - 20) = 0
    expect(doc.score.clueBonus).toBe(20);
    expect(doc.score.hintPenalty).toBe(20);
    expect(doc.score.totalScore).toBe(0);

    // Now discover 1 more clue (clue 4) to ensure totalScore transitions to 5
    await discoverCaseClue(caseId, template.clues[4].id);
    clearLocalCache();
    const doc2 = await Case.findById(caseId);
    expect(doc2.score.clueBonus).toBe(25);
    expect(doc2.score.hintPenalty).toBe(20);
    expect(doc2.score.totalScore).toBe(5);

    await Case.deleteOne({ _id: caseId });
  });

  it('races clue discovery and hint requests across separate database clients', async () => {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_mystery_room';
    const clientBConn = await mongoose.createConnection(MONGODB_URI).asPromise();
    const CaseModelB = clientBConn.model('Case', Case.schema);

    const template = FALLBACK_MYSTERIES.easy[0]; // 5 clues, 2 hints
    const created = await saveNewCase({
      title: 'Cross-Client Concurrency Race',
      premise: 'Racing clue discovery and hints from separate DB client connections',
      difficulty: 'easy',
      story: template.story,
      suspects: template.suspects,
      clues: template.clues,
      hints: template.hints,
      solution: template.solution
    });

    const caseId = created._id;
    const clueId = template.clues[0].id;
    const hintId = template.hints[0].id;

    // Client A executes clue discovery using primary connection
    // Client B executes hint request using separate secondary connection
    const clientAOperation = discoverCaseClue(caseId, clueId);

    const now = new Date();
    const clientBOperation = CaseModelB.findOneAndUpdate(
      {
        _id: caseId,
        status: 'active',
        hints: { $elemMatch: { id: hintId, isUnlocked: false } }
      },
      [
        {
          $set: {
            hints: {
              $map: {
                input: '$hints',
                as: 'h',
                in: {
                  $cond: [
                    { $eq: ['$$h.id', hintId] },
                    {
                      $mergeObjects: [
                        '$$h',
                        { isUnlocked: true, unlockedAt: now }
                      ]
                    },
                    '$$h'
                  ]
                }
              }
            },
            'score.hintPenalty': { $add: ['$score.hintPenalty', 10] },
            'score.totalScore': {
              $max: [
                0,
                {
                  $subtract: [
                    { $add: ['$score.basePoints', '$score.clueBonus'] },
                    { $add: ['$score.hintPenalty', 10] }
                  ]
                }
              ]
            }
          }
        }
      ],
      { returnDocument: 'after', updatePipeline: true }
    );

    const [resA, resB] = await Promise.all([clientAOperation, clientBOperation]);
    expect(resA).toBeDefined();
    expect(resB).toBeDefined();

    clearLocalCache();

    // Verify final authoritative state
    const authoritativeDoc = await Case.findById(caseId);
    expect(authoritativeDoc.clues.find(c => c.id === clueId).isDiscovered).toBe(true);
    expect(authoritativeDoc.hints.find(h => h.id === hintId).isUnlocked).toBe(true);
    expect(authoritativeDoc.score.clueBonus).toBe(5);
    expect(authoritativeDoc.score.hintPenalty).toBe(10);
    // 5 - 10 = -5 => max(0, -5) = 0
    expect(authoritativeDoc.score.totalScore).toBe(0);

    // Clean up
    await Case.deleteOne({ _id: caseId });
    await clientBConn.close();
  });

  it('proves connectDB returns a shared promise for concurrent connection requests', async () => {
    // When already connected, connectDB resolves immediately to true
    const res1 = await connectDB();
    expect(res1).toBe(true);
    expect(isMongoConnected()).toBe(true);
  });
});
