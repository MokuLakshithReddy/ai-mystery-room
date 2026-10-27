import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

export const GeminiMysterySchema = z.object({
  title: z.string().min(3),
  story: z.object({
    synopsis: z.string().min(20),
    victim: z.string().min(2),
    crimeScene: z.string().min(3),
    crimeType: z.string().min(3),
    timeOfCrime: z.string().min(2),
  }),
  suspects: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    alibi: z.string(),
    motive: z.string(),
    relationship: z.string(),
    demeanor: z.string(),
  })),
  clues: z.array(z.object({
    id: z.string(),
    title: z.string(),
    location: z.string(),
    description: z.string(),
  })),
  hints: z.array(z.object({
    id: z.string(),
    text: z.string(),
  })),
  solution: z.object({
    culpritId: z.string(),
    culpritName: z.string(),
    motiveExplanation: z.string(),
    solutionBreakdown: z.string(),
    crucialClueIds: z.array(z.string()),
  })
});

const DIFFICULTY_CONFIG = {
  easy: { suspects: 3, clues: 5, hints: 2 },
  medium: { suspects: 4, clues: 7, hints: 3 },
  hard: { suspects: 5, clues: 9, hints: 3 }
};

/**
 * Generate a complete mystery case using Gemini or fallback generator
 */
export async function generateMysteryCase(premise, difficulty = 'medium') {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 10) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
You are the master narrative architect for "AI Mystery Room", an interactive whodunit detective game.
Create a rich, logically airtight, and intriguing murder/crime mystery based on the following premise:
Premise: "${premise}"
Difficulty: "${difficulty}"

STRICT REQUIREMENTS:
1. Suspects count: EXACTLY ${config.suspects} suspects. Each suspect must have a unique id ("suspect_1", "suspect_2", etc.), name, role, alibi, motive, relationship to victim, and demeanor.
2. Clues count: EXACTLY ${config.clues} clues. Each clue must have a unique id ("clue_1", "clue_2", etc.), title, location (e.g. "Library Fireplace", "Victim's Smartwatch"), and detailed forensic description.
3. Hints count: EXACTLY ${config.hints} hints. Each hint must have a unique id ("hint_1", "hint_2", etc.) and subtle text pointing investigators in the right direction without directly spoiling the culprit.
4. Solution: Pick EXACTLY ONE culprit from the suspects list. The culpritId must match their suspect id. Provide motiveExplanation, full solutionBreakdown explaining how the crime was committed and how the clues prove it, and crucialClueIds array of clue ids that condemn them.
5. FAIR PLAY WHODUNIT: The clues MUST logically point to the culprit and eliminate other suspects with airtight reasoning.

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
    { "id": "suspect_1", "name": string, "role": string, "alibi": string, "motive": string, "relationship": string, "demeanor": string }
  ],
  "clues": [
    { "id": "clue_1", "title": string, "location": string, "description": string }
  ],
  "hints": [
    { "id": "hint_1", "text": string }
  ],
  "solution": {
    "culpritId": "suspect_1",
    "culpritName": string,
    "motiveExplanation": string,
    "solutionBreakdown": string,
    "crucialClueIds": ["clue_1", "clue_3"]
  }
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        }
      });

      const responseText = response.text?.trim() || '';
      // Parse JSON and validate with Zod
      const parsedData = JSON.parse(responseText);
      const validated = GeminiMysterySchema.parse(parsedData);

      // Verify that culpritId exists in suspects
      const culpritExists = validated.suspects.some(s => s.id === validated.solution.culpritId);
      if (!culpritExists && validated.suspects.length > 0) {
        validated.solution.culpritId = validated.suspects[0].id;
        validated.solution.culpritName = validated.suspects[0].name;
      }

      return validated;
    } catch (err) {
      console.warn('Gemini API call failed or quota exceeded, seamlessly switching to procedural case generator:', err.message);
      // Fall through to procedural fallback
    }
  }

  // Fallback procedural mystery generation tailored to premise and difficulty
  return generateProceduralMystery(premise, difficulty, config);
}

/**
 * Fallback procedural case generator with high-quality atmospheric detective cases
 */
function generateProceduralMystery(premise, difficulty, config) {
  const themes = [
    {
      title: "The Midnight Gala Cyanide Toast",
      victim: "Lord Alistair Sterling",
      crimeType: "Poisoning Homicide",
      crimeScene: "Sterling Grand Ballroom & Private Conservatory",
      timeOfCrime: "11:45 PM during the anniversary toast",
      synopsis: `During Lord Alistair Sterling's 60th birthday gala, he raised a vintage 1947 champagne flute to address his prominent guests. Moments after his first sip, he collapsed clutching his throat. An aroma of bitter almonds lingered around his glass. The storm outside knocked out the conservatory power grid shortly beforehand.`,
      suspectPool: [
        { id: "suspect_1", name: "Lady Genevieve Sterling", role: "Spouse & Heiress", alibi: "Claims she was greeting guests by the grand foyer staircase with the chamber orchestra.", motive: "Furious over a recent codicil disinheriting her in favor of Alistair's secret prodigy.", relationship: "Wife of 22 years", demeanor: "Composed yet visibly tense, clutching a pearl handkerchief." },
        { id: "suspect_2", name: "Dr. Julian Mercer", role: "Personal Physician & Biochemist", alibi: "Claims he was upstairs fetching Alistair's angina medicine from the suite.", motive: "Alistair uncovered illegal off-book pharmaceutical patents under the hospital wing.", relationship: "Lifelong physician and research trustee", demeanor: "Analytical, guarded, checking his wristwatch incessantly." },
        { id: "suspect_3", name: "Marcus 'Jax' Finch", role: "Sommelier & Caterer", alibi: "States he was opening champagne reserves in the basement wine cellar.", motive: "Heavily indebted to loan sharks; caught skimming vintage bottles last quarter.", relationship: "Head hospitality contractor", demeanor: "Nervous, hands shaking slightly while polishing glassware." },
        { id: "suspect_4", name: "Elena Ramos", role: "Private Secretary & Archivist", alibi: "Claims she was monitoring the silent auction bids in the East Salon.", motive: "Discovered Alistair planned to terminate her and seal the archive logs.", relationship: "Chief of Staff for 6 years", demeanor: "Quiet, observant, holding a leather executive notebook." },
        { id: "suspect_5", name: "Baron Viktor Von Berg", role: "Business Rival & Venture Partner", alibi: "Smoked a Cuban cigar on the rain-swept terrace veranda alone.", motive: "Hostile takeover deal collapsed hours earlier when Alistair vetoed the buyout.", relationship: "Longtime competitor", demeanor: "Smug, dismissive of authority, wearing bespoke velvet." }
      ],
      cluePool: [
        { id: "clue_1", title: "Shattered Crystal Flute", location: "Grand Ballroom Dais", description: "Crystalline residue with noticeable almond scent. Chemical swab confirms crystalline potassium cyanide." },
        { id: "clue_2", title: "Dispenser Dropper Bottle", location: "Conservatory Orchid Planter", description: "A dark amber dropper vial labeled 'Digitalis Tincture' disguised inside soil; contains trace cyanide." },
        { id: "clue_3", title: "Torn Cufflink Thread", location: "Conservatory Power Fuse Box", description: "A monogrammed silk thread snagged on the circuit breaker latch, matching physician lab cuffs." },
        { id: "clue_4", title: "Cellar Inventory Log", location: "Basement Wine Vault", description: "Wine logbook indicates bottle #47 was uncorked by Marcus at 11:20 PM under the direct supervision of Dr. Mercer." },
        { id: "clue_5", title: "Encrypted Telegram Draft", location: "Library Desk Blotter", description: "Drafted wire stating: 'Medical audit finalized. License revocation and federal referral at dawn.' Addressed to Dr. Mercer." },
        { id: "clue_6", title: "Muddy Garden Loafers", location: "Rear Scullery Exit", description: "Wet loafers size 11 with greenhouse fertilizer and crushed orchid petals along the welt." },
        { id: "clue_7", title: "Altered Medication Vial", location: "Upstairs Master Bedroom", description: "Standard angina pills intact, but the emergency nitroglycerin spray bottle was drained and wiped with solvent." },
        { id: "clue_8", title: "Power Switch Fingerprint", location: "Fuse Box Master Switch", description: "Smudged latex powdered residue found on the 11:40 PM circuit breaker toggle switch." },
        { id: "clue_9", title: "Hidden Audio Dictaphone", location: "Behind the Velvet Curtain", description: "A pocket recorder documenting a tense whisper at 11:38 PM: 'One sip ends your threats, Alistair.'" }
      ],
      hintsPool: [
        { id: "hint_1", text: "Pay close attention to who had clinical access to toxic reagents and knew the victim's exact medical routine." },
        { id: "hint_2", text: "Look closely at the items recovered around the conservatory fuse box and the orchid planter." },
        { id: "hint_3", text: "The encrypted telegram on the desk reveals whose career Alistair was about to destroy at dawn." }
      ],
      culpritIndex: 1, // Dr. Julian Mercer
      solution: {
        culpritId: "suspect_2",
        culpritName: "Dr. Julian Mercer",
        motiveExplanation: "Lord Alistair had completed an independent medical audit proving Dr. Mercer engaged in illegal biochemical patents, which would have stripped his medical license and led to a federal prison sentence.",
        solutionBreakdown: "Dr. Mercer slipped away under the pretense of retrieving heart medication. He cut the power to the conservatory fuse box, leaving forensic latex powder and a torn cufflink thread. In the dark, he injected potassium cyanide into Alistair's private champagne flute using the medicine dropper later discarded in the orchid planter.",
        crucialClueIds: ["clue_2", "clue_3", "clue_5"]
      }
    },
    {
      title: "Sabotage at Neon Heights Penthouse",
      victim: "Vikram Chen, Tech Billionaire",
      crimeType: "Exsanguination by Laser Severance",
      crimeScene: "Sub-penthouse Autonomous AI Server Chamber",
      timeOfCrime: "02:15 AM during automated backup cycle",
      synopsis: `Tech magnate Vikram Chen was found deceased inside the hermetically sealed vault of his smart penthouse. The neural security system went dark for exactly 180 seconds. Physical security locks were bypassed using a master encrypted biometric keycard.`,
      suspectPool: [
        { id: "suspect_1", name: "Maya Lin", role: "Lead AI Systems Architect", alibi: "Claims she was monitoring the server latency remotely from the guest pod.", motive: "Vikram was about to sell her open-source neural engine to a foreign military contractor.", relationship: "Co-founder & Chief Engineer", demeanor: "Cold, highly analytical, refuses to look at the crime scene photos." },
        { id: "suspect_2", name: "Cole Vance", role: "Head of Private Security", alibi: "States he was patrolling the lower sky-deck perimeter on level 45.", motive: "Scheduled to be replaced by fully automated combat drones next Monday.", relationship: "Head of security for 5 years", demeanor: "Defensive, tactical posture, uniform immaculate." },
        { id: "suspect_3", name: "Sloan Sterling", role: "Venture Capital Partner", alibi: "Sleeping in the guest quarters with noise-cancelling neural implants.", motive: "Invested $80M that Vikram diverted to a shell account in the Cayman Islands.", relationship: "Primary venture backer", demeanor: "Aggressive, anxious, demanding his legal counsel." },
        { id: "suspect_4", name: "Kira Thorne", role: "Cybernetic Specialist & Surgeon", alibi: "Calibrating biometric diagnostics in the med-bay suite.", motive: "Vikram suppressed her whistleblowing report regarding lethal sensor glitches.", relationship: "Personal physician & biomedical advisor", demeanor: "Empathetic, troubled, nervous ticks." },
        { id: "suspect_5", name: "Dante Rossi", role: "Autonomous Drone Operator", alibi: "Performing drone maintenance on the landing pad.", motive: "Blamed for a lethal test crash that ruined his professional flight certification.", relationship: "Contract drone flight engineer", demeanor: "Quiet, twitchy, smell of solder on his jacket." }
      ],
      cluePool: [
        { id: "clue_1", title: "De-authorized Keycard", location: "Ventilation Shaft Grille", description: "A high-clearance executive keycard cloned with firmware build 4.19 matching Maya Lin's terminal." },
        { id: "clue_2", title: "Overridden Laser Cutter", location: "Server Bay Perimeter", description: "The maintenance laser was manually re-calibrated from 20 watts to 2000 watts using root console access." },
        { id: "clue_3", title: "Burnt Microcontroller", location: "Security Junction 4", description: "A hardware bypass dongle manufactured exclusively in Maya's private rapid-prototyping lab." },
        { id: "clue_4", title: "Encrypted USB Stick", location: "Under the Server Subfloor", description: "Contains a repository clone titled 'Neural-Engine-Defense-Contract-REVOKED'." },
        { id: "clue_5", title: "Security Drone Flight Log", location: "Sky-Deck Docking Bay", description: "Logs confirm Cole Vance's patrol never deviated from the outer terrace perimeter." },
        { id: "clue_6", title: "Smartwatch Biometric Spike", location: "Victim's Left Wrist", description: "Vikram's heart rate spiked at 02:14 AM upon recognizing someone with authorized retinal clearance." },
        { id: "clue_7", title: "Wiped Terminal Terminal History", location: "Desk Hologram Station", description: "Terminal history was wiped with script 'maya_cleanup.sh' run at 02:22 AM." },
        { id: "clue_8", title: "Silicone Fingerprint Sleeve", location: "Recycling Waste Chute", description: "A discarded synthetic dermal glove replicating Vikram's right thumb print." },
        { id: "clue_9", title: "Cloud Backup Log Snapshot", location: "Offsite Mirror Node", description: "Snapshot shows an unauthorized 40TB transfer of neural source code initiated from guest pod terminal." }
      ],
      hintsPool: [
        { id: "hint_1", text: "The security breach required root firmware access and deep familiarity with the laser cutter calibration." },
        { id: "hint_2", text: "Check who had motive related to the defense contract sale and the skills to create custom bypass dongles." },
        { id: "hint_3", text: "Look at the terminal scripts and cloned firmware versions found near the ventilation shaft." }
      ],
      culpritIndex: 0, // Maya Lin
      solution: {
        culpritId: "suspect_1",
        culpritName: "Maya Lin",
        motiveExplanation: "Vikram secretly signed a contract to sell Maya's life work—a humanitarian AI engine—to a defense conglomerate, betraying their founding pact and her personal ethics.",
        solutionBreakdown: "Maya utilized her proprietary firmware dongle to trigger a 180-second localized blindspot in the server chamber. She entered with a cloned keycard, altered the laser cutter safety thresholds to lethal levels, and triggered the beam when Vikram approached the console.",
        crucialClueIds: ["clue_1", "clue_3", "clue_7"]
      }
    }
  ];

  // Pick theme based on premise or randomize
  const selectedTheme = premise.toLowerCase().includes('tech') || premise.toLowerCase().includes('cyber') || premise.toLowerCase().includes('penthouse')
    ? themes[1]
    : themes[0];

  const suspects = selectedTheme.suspectPool.slice(0, config.suspects);
  const clues = selectedTheme.cluePool.slice(0, config.clues);
  const hints = selectedTheme.hintsPool.slice(0, config.hints);

  // Ensure culprit is within chosen suspects
  let culprit = suspects.find(s => s.id === selectedTheme.solution.culpritId);
  if (!culprit) {
    culprit = suspects[0];
  }

  return {
    title: premise.length > 10 ? `The Case of ${premise.slice(0, 40)}` : selectedTheme.title,
    story: {
      synopsis: selectedTheme.synopsis,
      victim: selectedTheme.victim,
      crimeScene: selectedTheme.crimeScene,
      crimeType: selectedTheme.crimeType,
      timeOfCrime: selectedTheme.timeOfCrime
    },
    suspects,
    clues,
    hints,
    solution: {
      culpritId: culprit.id,
      culpritName: culprit.name,
      motiveExplanation: selectedTheme.solution.motiveExplanation,
      solutionBreakdown: selectedTheme.solution.solutionBreakdown,
      crucialClueIds: selectedTheme.solution.crucialClueIds.filter(id => clues.some(c => c.id === id))
    }
  };
}
