import React from 'react';
import { User, AlertTriangle, ShieldCheck, HeartCrack, Eye, Target } from 'lucide-react';

export default function SuspectCard({ suspect, isSelected, onSelect, onQuickAccuse }) {
  return (
    <div 
      onClick={onSelect}
      className={`group relative rounded-xl p-5 border transition-all duration-200 cursor-pointer ${
        isSelected 
          ? 'bg-red-950/30 border-red-500 shadow-lg shadow-red-950/40' 
          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
      }`}
    >
      {/* Header with Avatar & Role */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border font-bold text-lg font-mono ${
            isSelected
              ? 'bg-red-500/20 text-red-400 border-red-500/50'
              : 'bg-slate-800 text-slate-300 border-slate-700 group-hover:border-slate-600'
          }`}>
            <User className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
              {suspect.name}
            </h4>
            <span className="inline-block text-xs font-mono font-medium text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {suspect.role}
            </span>
          </div>
        </div>

        {isSelected && (
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-1 bg-red-600 text-white rounded shadow-sm">
            Prime Target
          </span>
        )}
      </div>

      {/* Details Grid */}
      <div className="space-y-2.5 text-xs">
        {/* Relationship */}
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono mb-0.5">
            <HeartCrack className="w-3.5 h-3.5 text-pink-400" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Relationship</span>
          </div>
          <p className="text-slate-200">{suspect.relationship}</p>
        </div>

        {/* Alibi */}
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono mb-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Stated Alibi</span>
          </div>
          <p className="text-slate-300 italic">"{suspect.alibi}"</p>
        </div>

        {/* Motive */}
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono mb-0.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Potential Motive</span>
          </div>
          <p className="text-slate-300">{suspect.motive}</p>
        </div>

        {/* Demeanor */}
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono mb-0.5">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold uppercase tracking-wider text-[10px]">Investigator Notes</span>
          </div>
          <p className="text-slate-400">{suspect.demeanor}</p>
        </div>
      </div>

      {/* Action footer */}
      {onQuickAccuse && (
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickAccuse(suspect);
            }}
            className="flex items-center gap-1.5 text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white transition-all shadow-sm"
          >
            <Target className="w-3.5 h-3.5" />
            Formal Accusation
          </button>
        </div>
      )}
    </div>
  );
}
