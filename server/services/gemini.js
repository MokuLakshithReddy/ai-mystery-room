import { GoogleGenAI } from '@google/genai';
import { DIFFICULTY_CONFIG, validateMystery } from './mysteryValidator.js';
import { getFallbackMystery } from './fallbackLibrary.js';

const MAX_GENERATION_RETRIES = 2;
const GEMINI_TIMEOUT_MS = 25000;

/**
 * Generate a complete mystery case using Gemini with strict schema & logic validation,
 * bounded retries, and certified fallback handling.
 *
 * @param {string} premise - User-supplied mystery premise
 * @param {string} difficulty - 'easy' | 'medium' | 'hard'
 * @returns {Promise<object>} Fully validated mystery object
 */
export async function generateMysteryCase(premise, difficulty = 'medium') {
  const normalizedDiff = (difficulty || '').toLowerCase().trim();
  const config = DIFFICULTY_CONFIG[normalizedDiff];

  if (!config) {
    throw new Error(`Unsupported difficulty: "${difficulty}". Must be one of: easy, medium, hard.`);
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // If a valid Gemini API key is configured, attempt model generation with bounded retries
  if (apiKey && apiKey.trim().length > 10 && !apiKey.includes('your_gemini')) {
    let attempts = 0;

    while (attempts < MAX_GENERATION_RETRIES) {
      attempts++;
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = buildGeminiPrompt(premise, normalizedDiff, config);

        // Enforce request timeout
        const responsePromise = ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          }
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API call timed out')), GEMINI_TIMEOUT_MS)
        );

        const response = await Promise.race([responsePromise, timeoutPromise]);
        const responseText = response.text?.trim() || '';

        if (!responseText) {
          throw new Error('Received empty response from Gemini model');
        }

        let parsedData;
        try {
          parsedData = JSON.parse(responseText);
        } catch (jsonErr) {
          throw new Error(`Malformed JSON response from model: ${jsonErr.message}`);
        }

        // Validate structure, exact counts, cross-references, and logical consistency
        const validation = validateMystery(parsedData, normalizedDiff);

        if (!validation.valid) {
          console.warn(
            `[Gemini Generation Attempt ${attempts}/${MAX_GENERATION_RETRIES} Failed Validation]:`,
            validation.errors.join('; ')
          );
          // Loop and retry if attempts remain
          continue;
        }

        // Return verified mystery
        return parsedData;
      } catch (err) {
        console.warn(
          `[Gemini Generation Attempt ${attempts}/${MAX_GENERATION_RETRIES} Encountered Error]:`,
          err.message
        );
      }
    }

    console.warn(
      `All ${MAX_GENERATION_RETRIES} Gemini generation attempts failed or were rejected. Using certified fallback.`
    );
  }

  // Use certified fallback template satisfying the exact difficulty matrix
  const fallback = getFallbackMystery(normalizedDiff, premise);
  const fallbackValidation = validateMystery(fallback, normalizedDiff);

  if (!fallbackValidation.valid) {
    throw new Error(
      `Internal Error: Fallback mystery template failed validation: ${fallbackValidation.errors.join(', ')}`
    );
  }

  return fallback;
}

/**
 * Builds the strict structured JSON prompt for Gemini
 */
function buildGeminiPrompt(premise, difficulty, config) {
  return `
You are the master narrative architect for "AI Mystery Room", an interactive whodunit detective game.
Create a rich, logically airtight, and intriguing murder/crime mystery based on the following user premise:
Premise: "${premise}"
Difficulty: "${difficulty}"

STRICT COUNTS (MANDATORY):
1. Suspects count: EXACTLY ${config.suspects} suspects. Each suspect must have a unique id ("suspect_1", "suspect_2", etc.), name, role, alibi, motive, relationship to victim, and demeanor.
2. Clues count: EXACTLY ${config.clues} clues. Each clue must have a unique id ("clue_1", "clue_2", etc.), title, location, and detailed physical description.
3. Hints count: EXACTLY ${config.hints} hints. Each hint must have a unique id ("hint_1", "hint_2", etc.) and text guiding investigators without giving away the answer directly.
4. Solution:
   - "culpritId" MUST EXACTLY MATCH the "id" of one of the suspects in your suspects list.
   - "culpritName" MUST match that suspect's name.
   - "crucialClueIds" MUST be an array containing ONLY valid "id" values from your clues list that prove their guilt.
   - "motiveExplanation" MUST clearly state why this specific culprit committed the crime.
   - "solutionBreakdown" MUST explain the step-by-step execution of the crime and how the crucial clues logically condemn them.

FAIR-PLAY WHODUNIT RULES:
- The culprit MUST be among the ${config.suspects} suspects.
- The clues MUST provide evidence eliminating false leads and proving the true culprit's opportunity and guilt.
- No supernatural explanations or outside perpetrators.

Respond ONLY with valid, unescaped JSON matching this schema:
{
  "title": string,
  "story": {
    "synopsis": string,
    "victim": string,
    "crimeScene": string,
    "crimeType": string,
    "timeOfCrime": string
  },
  "suspects": [
    {
      "id": "suspect_1",
      "name": string,
      "role": string,
      "alibi": string,
      "motive": string,
      "relationship": string,
      "demeanor": string
    }
  ],
  "clues": [
    {
      "id": "clue_1",
      "title": string,
      "location": string,
      "description": string
    }
  ],
  "hints": [
    {
      "id": "hint_1",
      "text": string
    }
  ],
  "solution": {
    "culpritId": "suspect_1",
    "culpritName": string,
    "motiveExplanation": string,
    "solutionBreakdown": string,
    "crucialClueIds": ["clue_1"]
  }
}
`;
}
