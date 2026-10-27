import React, { useState } from 'react';
import { HelpCircle, Sparkles, AlertCircle, Lock, Unlock, ChevronDown, ChevronUp } from 'lucide-react';

export default function HintDrawer({ hints, onRequestHint }) {
  const [isOpen, setIsOpen] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const unlockedCount = hints.filter(h => h.isUnlocked).length;
  const remainingCount = hints.length - unlockedCount;

  const handleConfirmUnlock = async () => {
    setIsRequesting(true);
    try {
      await onRequestHint();
      setShowConfirmModal(false);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl backdrop-blur-md">
      {/* Header Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors border-b border-slate-800"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Forensic Intelligence Hints
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {unlockedCount} / {hints.length} Unlocked
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Each hint declassified deducts <span className="text-amber-400 font-semibold font-mono">10 points</span> from your score.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {remainingCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowConfirmModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-mono text-xs font-bold border border-cyan-500/40 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Request Hint (-10 Pts)
            </button>
          )}

          <button type="button" className="text-slate-400 hover:text-white p-1">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Body Content */}
      {isOpen && (
        <div className="p-4 space-y-3">
          {hints.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No hints available for this case.</p>
          ) : (
            hints.map((hint, idx) => (
              <div
                key={hint.id || idx}
                className={`p-3.5 rounded-lg border text-xs transition-all ${
                  hint.isUnlocked
                    ? 'bg-slate-950/80 border-cyan-500/40 text-slate-200'
                    : 'bg-slate-950/40 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 text-cyan-400">
                    {hint.isUnlocked ? (
                      <>
                        <Unlock className="w-3 h-3 text-cyan-400" />
                        DECLASSIFIED HINT #{idx + 1}
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-slate-600" />
                        CLASSIFIED HINT #{idx + 1}
                      </>
                    )}
                  </span>

                  {hint.isUnlocked && hint.unlockedAt && (
                    <span className="text-[10px] font-mono text-slate-400">
                      Unlocked at {new Date(hint.unlockedAt).toLocaleTimeString()}
                    </span>
                  )}
                </div>

                {hint.isUnlocked ? (
                  <p className="text-slate-200 font-sans leading-relaxed mt-1">
                    {hint.text}
                  </p>
                ) : (
                  <p className="italic text-slate-400">
                    Content sealed. Request hint to declassify forensic guidance.
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Declassify Forensic Hint?</h4>
                <p className="text-xs text-slate-400">Investigator Penalty Warning</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Requesting this hint will reveal subtle forensic analysis but will immediately deduct <strong className="text-amber-400 font-mono font-bold">10 points</strong> from your final investigation score.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-mono font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUnlock}
                disabled={isRequesting}
                className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm flex items-center gap-2"
              >
                {isRequesting ? 'Unlocking...' : 'Accept Penalty & Unlock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
