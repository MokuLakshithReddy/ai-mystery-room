import React, { useState } from 'react';
import { Search, MapPin, CheckCircle, Sparkles, Lock, Clock } from 'lucide-react';

export default function ClueCard({ clue, onDiscover }) {
  const [isExamining, setIsExamining] = useState(false);

  const handleInspect = async (e) => {
    e.stopPropagation();
    if (clue.isDiscovered || isExamining) return;
    setIsExamining(true);
    try {
      await onDiscover(clue.id);
    } finally {
      setIsExamining(false);
    }
  };

  return (
    <div className={`relative rounded-xl p-5 border transition-all duration-300 ${
      clue.isDiscovered 
        ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-950/20' 
        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
    }`}>
      {/* Location tag & status */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-slate-300">{clue.location}</span>
        </div>

        {clue.isDiscovered ? (
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3 h-3" />
            CATALOGED (+5 PTS)
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            <Lock className="w-3 h-3" />
            UNEXAMINED
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className={`text-base font-bold mb-2 ${
        clue.isDiscovered ? 'text-white' : 'text-slate-400'
      }`}>
        {clue.title}
      </h4>

      {/* Description or Concealed placeholder */}
      {clue.isDiscovered ? (
        <div className="space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 font-sans">
            {clue.description}
          </p>

          {clue.discoveredAt && (
            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
              <Clock className="w-3 h-3 text-slate-400" />
              Discovered: {new Date(clue.discoveredAt).toLocaleTimeString()}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-slate-400 italic">
            This sector of the crime scene has not been forensically analyzed yet.
          </p>

          <button
            type="button"
            onClick={handleInspect}
            disabled={isExamining}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 font-mono text-xs font-bold transition-all shadow-sm group"
          >
            {isExamining ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                Analyzing forensic traces...
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                Examine Evidence (+5 Pts)
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
