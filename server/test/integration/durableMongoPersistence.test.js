import { describe, it, expect, beforeAll } from 'vitest';
import mongoose from 'mongoose';
import { 
  saveNewCase, 
  discoverCaseClue, 
  requestCaseHint, 
  submitCaseAccusation, 
  clearLocalCache 
} from '../../models/CaseStore.js';
import { Case } from '../../models/Case.js';
import { FALLBACK_MYSTERIES } from '../../services/fallbackLibrary.js';

describe('Durable MongoDB Persistence & Cache-Clearing Independence', () => {
  beforeAll(async () => {
    // Explicitly require MongoDB connection
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_mystery_room';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    }
    expect(mongoose.connection.readyState).toBe(1);

    // Disable in-memory fallback to guarantee all operations target MongoDB
    delete process.env.ALLOW_IN_MEMORY_FOR_TESTS;
  });

  it('proves case creation writes durably to MongoDB and survives cache clearing', async () => {
    const template = FALLBACK_MYSTERIES.easy[0];
    const created = await saveNewCase({
      title: template.title,
      premise: 'Durable MongoDB persistence verification case',
      difficulty: 'easy',
      story: template.story,
      suspects: template.suspects,
      clues: template.clues,
      hints: template.hints,
      solution: template.solution
    });

    const caseId = created._id;
    expect(caseId).toBeDefined();

    // 1. Clear process memory cache completely (simulating process restart)
    clearLocalCache();

    // 2. Query MongoDB directly using Mongoose driver
    const docFromMongo = await Case.findById(caseId).select('+solution');
    expect(docFromMongo).not.toBeNull();
    expect(docFromMongo._id.toString()).toBe(caseId);
    expect(docFromMongo.title).toBe(template.title);
    expect(docFromMongo.suspects).toHaveLength(3);
    expect(docFromMongo.clues).toHaveLength(5);
    expect(docFromMongo.hints).toHaveLength(2);
    expect(docFromMongo.status).toBe('active');
    expect(docFromMongo.score.totalScore).toBe(0);

    // 3. Discover clue 1, clear cache, verify directly on MongoDB
    const clueToDiscover = docFromMongo.clues[0].id;
    const discoverResult = await discoverCaseClue(caseId, clueToDiscover);
    expect(discoverResult.clue.isDiscovered).toBe(true);

    clearLocalCache(); // Purge cache again

    const docAfterClue = await Case.findById(caseId);
    const mongoClue = docAfterClue.clues.find(c => c.id === clueToDiscover);
    expect(mongoClue.isDiscovered).toBe(true);
    expect(docAfterClue.score.clueBonus).toBe(5);
    expect(docAfterClue.score.totalScore).toBe(5);

    // 4. Request a hint, clear cache, verify directly on MongoDB
    const hintResult = await requestCaseHint(caseId);
    expect(hintResult.hint.isUnlocked).toBe(true);

    clearLocalCache(); // Purge cache again

    const docAfterHint = await Case.findById(caseId);
    const mongoHint = docAfterHint.hints.find(h => h.id === hintResult.hint.id);
    expect(mongoHint.isUnlocked).toBe(true);
    expect(docAfterHint.score.hintPenalty).toBe(10);
    // 5 clue bonus - 10 hint penalty = -5 => floored to 0
    expect(docAfterHint.score.totalScore).toBe(0);

    // 5. Submit accusation, clear cache, verify completed verdict directly on MongoDB
    const culpritId = docFromMongo.solution.culpritId;
    const accuseResult = await submitCaseAccusation(caseId, culpritId, 'Durable forensic proof');
    expect(accuseResult.isCorrect).toBe(true);

    clearLocalCache(); // Purge cache again

    const docAfterAccuse = await Case.findById(caseId).select('+solution');
    expect(docAfterAccuse.status).toBe('completed');
    expect(docAfterAccuse.playerAccusation.isCorrect).toBe(true);
    expect(docAfterAccuse.playerAccusation.accusedSuspectId).toBe(culpritId);
    // Easy correct: 100 base + 5 clue bonus - 10 hint penalty = 95
    expect(docAfterAccuse.score.basePoints).toBe(100);
    expect(docAfterAccuse.score.totalScore).toBe(95);

    // Clean up test document
    await Case.deleteOne({ _id: caseId });
  });

  it('proves database-level conditional update prevents duplicate clue scoring across independent operations', async () => {
    const template = FALLBACK_MYSTERIES.easy[0];
    const created = await saveNewCase({
      title: 'Concurrency Clue Test',
      premise: 'Testing database-level conditional clue updates',
      difficulty: 'easy',
      story: template.story,
      suspects: template.suspects,
      clues: template.clues,
      hints: template.hints,
      solution: template.solution
    });

    const caseId = created._id;
    const clueId = template.clues[0].id;

    // Simulate two separate operations discovering the same clue
    const [res1, res2] = await Promise.all([
      discoverCaseClue(caseId, clueId),
      discoverCaseClue(caseId, clueId)
    ]);

    clearLocalCache();

    const doc = await Case.findById(caseId);
    // Score must be exactly 5, not 10
    expect(doc.score.clueBonus).toBe(5);
    expect(doc.score.totalScore).toBe(5);

    // Clean up
    await Case.deleteOne({ _id: caseId });
  });
});
