import React from 'react';
import { Award, Compass, Search, HelpCircle } from 'lucide-react';

export default function ScoreBadge({ score, cluesCount, discoveredCount, hintsUsed, difficulty }) {
  const difficultyColors = {
    easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    hard: 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  const difficultyBonus = {
    easy: '100 Base',
    medium: '150 Base',
    hard: '200 Base'
  };

  const progressPercent = cluesCount > 0 ? Math.round((discoveredCount / cluesCount) * 100) : 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur-sm">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
        {/* Real-time score */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 block uppercase tracking-wider">
              Investigation Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-amber-400 font-mono tracking-tight">
                {score?.totalScore ?? 0}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">pts</span>
            </div>
          </div>
        </div>

        {/* Evidence progress */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 block uppercase tracking-wider">
              Evidence Found
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-white font-mono">
                {discoveredCount}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ {cluesCount}</span>
            </div>
          </div>
        </div>

        {/* Hints used */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 block uppercase tracking-wider">
              Hints Utilized
            </span>
            <span className="text-xl font-bold text-white font-mono">
              {hintsUsed}
            </span>
          </div>
        </div>

        {/* Difficulty badge */}
        <div className="flex sm:justify-end items-center">
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider ${difficultyColors[difficulty] || difficultyColors.medium}`}>
            {difficulty || 'MEDIUM'} • {difficultyBonus[difficulty] || '150 Base'}
          </div>
        </div>
      </div>

      {/* Discovery progress bar */}
      <div className="mt-3 pt-3 border-t border-slate-800/80">
        <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
          <span>Crime Scene Search Coverage</span>
          <span className="text-emerald-400 font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
