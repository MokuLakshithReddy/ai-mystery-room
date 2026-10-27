import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../index.js';

describe('Cases REST API Integration Tests', () => {
  let createdCaseId;
  let suspectsList = [];
  let cluesList = [];
  let hintsList = [];

  it('GET /api/health reports healthy system status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBeDefined();
    expect(res.body.ai).toBeDefined();
    expect(typeof res.body.uptime).toBe('number');
  });

  describe('POST /api/cases validation', () => {
    it('rejects premise shorter than 5 characters with 400', async () => {
      const res = await request(app)
        .post('/api/cases')
        .send({ premise: 'Cold', difficulty: 'easy' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Premise is too short/);
    });

    it('rejects premise longer than 300 characters with 400', async () => {
      const longPremise = 'A'.repeat(305);
      const res = await request(app)
        .post('/api/cases')
        .send({ premise: longPremise, difficulty: 'medium' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Premise is too long/);
    });

    it('rejects non-string premise with 400', async () => {
      const res = await request(app)
        .post('/api/cases')
        .send({ premise: 12345, difficulty: 'medium' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Premise must be a valid text string/);
    });

    it('rejects invalid or unsupported difficulty values with 400', async () => {
      const res = await request(app)
        .post('/api/cases')
        .send({ premise: 'Mysterious theft at high noon', difficulty: 'impossible' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Invalid difficulty/);
    });

    it('creates an Easy case with exact counts (3 suspects, 5 clues, 2 hints)', async () => {
      const res = await request(app)
        .post('/api/cases')
        .send({ premise: 'Museum antique diamond theft', difficulty: 'easy' });

      expect(res.status).toBe(201);
      expect(res.body.case.difficulty).toBe('easy');
      expect(res.body.case.suspects).toHaveLength(3);
      expect(res.body.case.clues).toHaveLength(5);
      expect(res.body.case.hints).toHaveLength(2);
      expect(res.body.case.solution).toBeUndefined(); // Secrecy boundary
    });

    it('creates a Medium case with exact counts (4 suspects, 7 clues, 3 hints)', async () => {
      const res = await request(app)
        .post('/api/cases')
        .send({ premise: 'Midnight gala cyanide poisoning in ballroom', difficulty: 'medium' });

      expect(res.status).toBe(201);
      expect(res.body.case.difficulty).toBe('medium');
      expect(res.body.case.suspects).toHaveLength(4);
      expect(res.body.case.clues).toHaveLength(7);
      expect(res.body.case.hints).toHaveLength(3);
      expect(res.body.case.solution).toBeUndefined();

      // Save for subsequent gameplay tests
      createdCaseId = res.body.case._id;
      suspectsList = res.body.case.suspects;
      cluesList = res.body.case.clues;
      hintsList = res.body.case.hints;
    });

    it('creates a Hard case with exact counts (5 suspects, 9 clues, 3 hints)', async () => {
      const res = await request(app)
        .post('/api/cases')
        .send({ premise: 'Cyberpunk quantum AI chamber severance', difficulty: 'hard' });

      expect(res.status).toBe(201);
      expect(res.body.case.difficulty).toBe('hard');
      expect(res.body.case.suspects).toHaveLength(5);
      expect(res.body.case.clues).toHaveLength(9);
      expect(res.body.case.hints).toHaveLength(3);
      expect(res.body.case.solution).toBeUndefined();
    });
  });

  describe('GET /api/cases/:id', () => {
    it('returns 404 for non-existent case ID', async () => {
      const res = await request(app).get('/api/cases/non_existent_id_999');
      expect(res.status).toBe(404);
      expect(res.body.error).toBeDefined();
    });

    it('returns sanitized active case data', async () => {
      const res = await request(app).get(`/api/cases/${createdCaseId}`);
      expect(res.status).toBe(200);
      expect(res.body.case._id).toBe(createdCaseId);
      expect(res.body.case.solution).toBeUndefined(); // Secrecy boundary
      expect(res.body.case.clues[0].description).toBeUndefined(); // Undiscovered clue masked
    });
  });

  describe('POST /api/cases/:id/clues/:clueId/discover', () => {
    it('returns 404 for invalid clue ID', async () => {
      const res = await request(app)
        .post(`/api/cases/${createdCaseId}/clues/fake_clue_id/discover`);
      expect(res.status).toBe(404);
    });

    it('discovers a clue, reveals description, and awards +5 points', async () => {
      const targetClue = cluesList[0];
      const res = await request(app)
        .post(`/api/cases/${createdCaseId}/clues/${targetClue.id}/discover`);

      expect(res.status).toBe(200);
      expect(res.body.clue.isDiscovered).toBe(true);
      expect(res.body.clue.description).toBeDefined();
      expect(res.body.currentScore).toBe(5);
      expect(res.body.cluesDiscoveredCount).toBe(1);
    });

    it('is idempotent: re-discovering the same clue does NOT award duplicate points', async () => {
      const targetClue = cluesList[0];
      const res = await request(app)
        .post(`/api/cases/${createdCaseId}/clues/${targetClue.id}/discover`);

      expect(res.status).toBe(200);
      expect(res.body.currentScore).toBe(5); // Still 5, not 10
      expect(res.body.cluesDiscoveredCount).toBe(1);
    });
  });

  describe('POST /api/cases/:id/hints', () => {
    it('unlocks next available hint and applies -10 points penalty', async () => {
      const res = await request(app)
        .post(`/api/cases/${createdCaseId}/hints`);

      expect(res.status).toBe(200);
      expect(res.body.hint.isUnlocked).toBe(true);
      expect(res.body.hint.text).toBeDefined();
      // Score was 5, penalty is -10 => 5 - 10 = -5 => floored to 0
      expect(res.body.currentScore).toBe(0);
      expect(res.body.hintsRemaining).toBe(2);
    });
  });

  describe('GET /api/cases/:id/result before accusation', () => {
    it('returns 400: solution remains sealed until formal accusation', async () => {
      const res = await request(app).get(`/api/cases/${createdCaseId}/result`);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/still active/i);
    });
  });

  describe('POST /api/cases/:id/accuse', () => {
    it('rejects missing suspectId with 400', async () => {
      const res = await request(app)
        .post(`/api/cases/${createdCaseId}/accuse`)
        .send({ rationale: 'I think he did it' });

      expect(res.status).toBe(400);
    });

    it('rejects accusation for non-existent suspect', async () => {
      const res = await request(app)
        .post(`/api/cases/${createdCaseId}/accuse`)
        .send({ suspectId: 'ghost_suspect_99' });

      expect(res.status).toBe(404);
    });

    it('submits accusation, locks case, reveals verdict and calculates final score', async () => {
      // In our medium cyanide template, Dr. Julian Mercer is suspect_2
      const res = await request(app)
        .post(`/api/cases/${createdCaseId}/accuse`)
        .send({
          suspectId: 'suspect_2',
          rationale: 'Cyanide residue in dropper and surgical cufflink thread at fuse box'
        });

      expect(res.status).toBe(200);
      expect(res.body.verdict).toBeDefined();
      expect(res.body.verdict.isCorrect).toBe(true);
      expect(res.body.verdict.culprit.id).toBe('suspect_2');
      expect(res.body.verdict.culprit.name).toBe('Dr. Julian Mercer');
      expect(res.body.verdict.motiveExplanation).toBeDefined();
      expect(res.body.verdict.solutionBreakdown).toBeDefined();

      // Score: Medium base 150 + 1 clue (5) - 1 hint (10) = 145
      expect(res.body.verdict.score.basePoints).toBe(150);
      expect(res.body.verdict.score.clueBonus).toBe(5);
      expect(res.body.verdict.score.hintPenalty).toBe(10);
      expect(res.body.verdict.score.totalScore).toBe(145);
    });

    it('rejects duplicate accusation on completed case', async () => {
      const res = await request(app)
        .post(`/api/cases/${createdCaseId}/accuse`)
        .send({ suspectId: 'suspect_1' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/already completed/i);
    });
  });

  describe('GET /api/cases/:id/result after accusation', () => {
    it('returns full declassified solution, culprit confession, and scorecard', async () => {
      const res = await request(app).get(`/api/cases/${createdCaseId}/result`);
      expect(res.status).toBe(200);
      expect(res.body.case.status).toBe('completed');
      expect(res.body.verdict.isCorrect).toBe(true);
      expect(res.body.verdict.culprit.name).toBe('Dr. Julian Mercer');
      expect(res.body.verdict.score.totalScore).toBe(145);
    });
  });

  describe('GET /api/cases', () => {
    it('returns sanitized list of recent cases without solutions', async () => {
      const res = await request(app).get('/api/cases');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.cases)).toBe(true);
      expect(res.body.cases.length).toBeGreaterThan(0);
      for (const c of res.body.cases) {
        if (c.status !== 'completed') {
          expect(c.solution).toBeUndefined();
        }
      }
    });
  });
});
