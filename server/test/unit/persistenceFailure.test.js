import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import { saveNewCase } from '../../models/CaseStore.js';
import { FALLBACK_MYSTERIES } from '../../services/fallbackLibrary.js';

describe('Durable Persistence Requirement & Failure Safety', () => {
  it('throws DURABLE_PERSISTENCE_FAILED when neither MongoDB nor Cloud Store are accessible', async () => {
    // Preserve environment
    const originalReadyState = mongoose.connection.readyState;
    const originalSupabaseUrl = process.env.SUPABASE_URL;
    const originalSupabaseKey = process.env.SUPABASE_KEY;
    const originalAllowMem = process.env.ALLOW_IN_MEMORY_FOR_TESTS;

    try {
      // Temporarily simulate disconnected Mongo and absent cloud credentials
      Object.defineProperty(mongoose.connection, 'readyState', { value: 0, configurable: true });
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_KEY;
      delete process.env.ALLOW_IN_MEMORY_FOR_TESTS;

      const template = FALLBACK_MYSTERIES.easy[0];

      // Expect saveNewCase to refuse in-memory spoofing and reject with DURABLE_PERSISTENCE_FAILED
      await expect(saveNewCase({
        title: template.title,
        premise: 'Testing persistence failure rejection',
        difficulty: 'easy',
        story: template.story,
        suspects: template.suspects,
        clues: template.clues,
        hints: template.hints,
        solution: template.solution
      })).rejects.toThrow(/DURABLE_PERSISTENCE_FAILED/);
    } finally {
      // Restore environment
      Object.defineProperty(mongoose.connection, 'readyState', { value: originalReadyState, configurable: true });
      if (originalSupabaseUrl) process.env.SUPABASE_URL = originalSupabaseUrl;
      if (originalSupabaseKey) process.env.SUPABASE_KEY = originalSupabaseKey;
      if (originalAllowMem) process.env.ALLOW_IN_MEMORY_FOR_TESTS = originalAllowMem;
    }
  });
});
