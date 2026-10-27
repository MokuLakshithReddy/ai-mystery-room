import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, ShieldAlert, Cpu, Search, Check, AlertCircle, Compass } from 'lucide-react';
import { createCase } from '../services/api';
import Loader from '../components/Loader';

const PRESET_SCENARIOS = [
  {
    title: "The Midnight Gala Cyanide Toast",
    premise: "A reclusive tech billionaire collapses clutching his throat during his 60th birthday gala champagne toast in a locked ballroom.",
    difficulty: "medium"
  },
  {
    title: "Sabotage at Neon Heights Penthouse",
    premise: "An autonomous AI architect found severed in a sealed server chamber with 180 seconds of deleted optical camera logs.",
    difficulty: "hard"
  },
  {
    title: "The Missing Venetian Diamond",
    premise: "A 100-carat blue diamond disappears from a private gallery vault during a lightning blackout without triggering the laser grid.",
    difficulty: "easy"
  },
  {
    title: "Murder on the Orient Hyperloop",
    premise: "A luxury mag-lev diplomat passenger found fatally poisoned in a first-class compartment sealed from the inside at 500 km/h.",
    difficulty: "medium"
  }
];

export default function CreateMystery() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [premise, setPremise] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [error, setError] = useState(null);

  // Read URL query params if user clicked from Home presets
  useEffect(() => {
    const qPremise = searchParams.get('premise');
    const qDiff = searchParams.get('difficulty');
    if (qPremise) setPremise(qPremise);
    if (qDiff && ['easy', 'medium', 'hard'].includes(qDiff.toLowerCase())) {
      setDifficulty(qDiff.toLowerCase());
    }
  }, [searchParams]);

  // Loading step simulation during AI generation
  useEffect(() => {
    if (!isGenerating) return;
    const steps = [
      "Consulting Gemini Story Engine...",
      "Generating suspects, conflicting alibis & motives...",
      "Scattering forensic clues across the crime scene...",
      "Enforcing fair-play whodunit logic...",
      "Sealing classified solution into evidence vault..."
    ];
    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current < steps.length) {
        setGenerationStep(current);
      }
    }, 1800);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleSelectPreset = (preset) => {
    setPremise(preset.premise);
    setDifficulty(preset.difficulty);
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    if (!premise || premise.trim().length < 5) {
      setError('Please provide a crime premise of at least 5 characters.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setGenerationStep(0);

    try {
      const response = await createCase({
        premise: premise.trim(),
        difficulty
      });

      const newCase = response.data?.case;
      if (newCase?._id) {
        navigate(`/case/${newCase._id}`);
      } else {
        throw new Error('Invalid case response received from server.');
      }
    } catch (err) {
      console.error('Case generation failed:', err);
      setError(err.response?.data?.error || err.message || 'Failed to generate mystery. Please try again.');
      setIsGenerating(false);
    }
  };

  const difficultyTiers = [
    {
      id: 'easy',
      title: 'Easy / Rookie',
      basePoints: 100,
      suspects: 3,
      clues: 5,
      hints: 2,
      desc: 'Straightforward clues, clear motives, ideal for beginners.',
      accent: 'border-emerald-500/40 hover:border-emerald-400 bg-emerald-500/5'
    },
    {
      id: 'medium',
      title: 'Medium / Detective',
      basePoints: 150,
      suspects: 4,
      clues: 7,
      hints: 3,
      desc: 'Subtle contradictions, false leads, classic Agatha Christie complexity.',
      accent: 'border-amber-500/40 hover:border-amber-400 bg-amber-500/5'
    },
    {
      id: 'hard',
      title: 'Hard / Mastermind',
      basePoints: 200,
      suspects: 5,
      clues: 9,
      hints: 3,
      desc: 'Intertwined alibis, intricate forensic trail, requires sharp deductive skills.',
      accent: 'border-red-500/40 hover:border-red-400 bg-red-500/5'
    }
  ];

  if (isGenerating) {
    const stepsMessages = [
      "Consulting Gemini Story Engine...",
      "Generating suspects, conflicting alibis & motives...",
      "Scattering forensic clues across the crime scene...",
      "Enforcing fair-play whodunit logic...",
      "Sealing classified solution into evidence vault..."
    ];
    return (
      <div className="max-w-2xl mx-auto py-20 px-4">
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-8 shadow-2xl backdrop-blur-md text-center space-y-6">
          <Loader 
            message="GENERATING CRIME SCENE..." 
            submessage={stepsMessages[generationStep] || "Assembling case files..."}
          />

          <div className="space-y-2 max-w-md mx-auto text-left">
            {stepsMessages.map((msg, idx) => (
              <div 
                key={idx}
                className={`flex items-center gap-2.5 text-xs font-mono transition-colors ${
                  idx < generationStep 
                    ? 'text-emerald-400 font-medium' 
                    : idx === generationStep 
                    ? 'text-amber-400 font-bold animate-pulse' 
                    : 'text-slate-600'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  idx < generationStep 
                    ? 'bg-emerald-400' 
                    : idx === generationStep 
                    ? 'bg-amber-400' 
                    : 'bg-slate-700'
                }`}></div>
                <span>{msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-amber-400 block mb-1">
          CASE DISPATCH & FORENSIC GENERATION
        </span>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Initialize New Mystery Case File
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Provide your own murder premise or pick a classic detective archetype. Gemini will synthesize a complete, solvable crime scene.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs font-mono flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Start Presets */}
      <div className="space-y-3">
        <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
          Quick-Start Presets:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESET_SCENARIOS.map((preset, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white group-hover:text-amber-300">
                  {preset.title}
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {preset.difficulty}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                {preset.premise}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Creation Form */}
      <form onSubmit={handleCreateCase} className="space-y-8">
        {/* Premise Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
              1. Crime Synopsis & Premise:
            </label>
            <span className="text-[11px] font-mono text-slate-500">
              {premise.length} characters
            </span>
          </div>
          <textarea
            rows={4}
            value={premise}
            onChange={(e) => setPremise(e.target.value)}
            placeholder="E.g., An antique collector murdered during a thunderstorm in a locked study with muddy tracks leading nowhere..."
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none font-sans"
          ></textarea>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
            2. Select Difficulty & Complexity Tier:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {difficultyTiers.map((tier) => {
              const isSelected = difficulty === tier.id;
              return (
                <div
                  key={tier.id}
                  onClick={() => setDifficulty(tier.id)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-950/20'
                      : tier.accent
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-white">{tier.title}</h4>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-slate-700'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-amber-400 font-semibold mb-2">
                    +{tier.basePoints} Base Bounty
                  </div>

                  <div className="space-y-1 text-xs text-slate-400 mb-3 font-mono">
                    <div>• {tier.suspects} Suspects</div>
                    <div>• {tier.clues} Crime Clues</div>
                    <div>• {tier.hints} Subtle Hints</div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug">
                    {tier.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-mono text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generate Crime Scene & Enter Investigation
          </button>
        </div>
      </form>
    </div>
  );
}
