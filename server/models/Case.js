import mongoose from 'mongoose';

const SuspectSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  alibi: { type: String, required: true },
  motive: { type: String, required: true },
  relationship: { type: String, required: true },
  demeanor: { type: String, required: true },
  avatarUrl: { type: String }
}, { _id: false });

const ClueSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  isDiscovered: { type: Boolean, default: false },
  discoveredAt: { type: Date }
}, { _id: false });

const HintSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  isUnlocked: { type: Boolean, default: false },
  unlockedAt: { type: Date }
}, { _id: false });

const SolutionSchema = new mongoose.Schema({
  culpritId: { type: String, required: true },
  culpritName: { type: String, required: true },
  motiveExplanation: { type: String, required: true },
  solutionBreakdown: { type: String, required: true },
  crucialClueIds: [{ type: String }]
}, { _id: false });

const PlayerAccusationSchema = new mongoose.Schema({
  accusedSuspectId: { type: String, required: true },
  rationale: { type: String },
  submittedAt: { type: Date, default: Date.now },
  isCorrect: { type: Boolean, required: true }
}, { _id: false });

const ScoreSchema = new mongoose.Schema({
  basePoints: { type: Number, default: 0 },
  clueBonus: { type: Number, default: 0 },
  hintPenalty: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 }
}, { _id: false });

const CaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  premise: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'], 
    required: true 
  },
  story: {
    synopsis: { type: String, required: true },
    victim: { type: String, required: true },
    crimeScene: { type: String, required: true },
    crimeType: { type: String, required: true },
    timeOfCrime: { type: String, required: true }
  },
  suspects: [SuspectSchema],
  clues: [ClueSchema],
  hints: [HintSchema],
  solution: { 
    type: SolutionSchema, 
    required: true, 
    select: false // Excluded by default in queries for security!
  },
  status: { 
    type: String, 
    enum: ['active', 'completed'], 
    default: 'active' 
  },
  playerAccusation: PlayerAccusationSchema,
  score: {
    type: ScoreSchema,
    default: () => ({ basePoints: 0, clueBonus: 0, hintPenalty: 0, totalScore: 0 })
  },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

// Helper method to sanitize case object for in-progress gameplay
CaseSchema.methods.toClientJSON = function () {
  const caseObj = this.toObject();
  
  // NEVER send solution to client if active
  if (this.status !== 'completed') {
    delete caseObj.solution;
  }

  // Sanitize clues: if not discovered, hide description to prevent inspect element cheating
  if (caseObj.clues) {
    caseObj.clues = caseObj.clues.map(c => {
      if (!c.isDiscovered) {
        return {
          id: c.id,
          title: c.location + ' - Unexamined Area',
          location: c.location,
          isDiscovered: false
        };
      }
      return c;
    });
  }

  // Sanitize hints: if not unlocked, hide hint text
  if (caseObj.hints) {
    caseObj.hints = caseObj.hints.map((h, index) => {
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

  return caseObj;
};

export const Case = mongoose.model('Case', CaseSchema);
