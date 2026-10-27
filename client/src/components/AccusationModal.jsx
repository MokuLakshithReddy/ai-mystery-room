import React, { useState } from 'react';
import { Target, AlertTriangle, X, ShieldAlert, Check } from 'lucide-react';

export default function AccusationModal({ suspects, initialSelectedId, isOpen, onClose, onSubmit }) {
  const [selectedSuspectId, setSelectedSuspectId] = useState(initialSelectedId || (suspects[0]?.id ?? ''));
  const [rationale, setRationale] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSuspectId) {
      setError('You must select a prime suspect to accuse.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        suspectId: selectedSuspectId,
        rationale: rationale.trim()
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit accusation. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-red-500/40 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400">
              <Target className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                FILE FORMAL ACCUSATION
              </h3>
              <p className="text-xs font-mono text-slate-400">
                Official Judicial Warrant & Investigator Verdict
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-200/90 leading-relaxed font-sans">
            <strong>Irreversible Legal Action:</strong> Once submitted, the case file will be sealed and the classified solution declassified. Ensure your deductive reasoning and clue trail are sound!
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Suspect Radio Selector */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-bold mb-3">
              1. Select The Perpetrator:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
              {suspects.map((suspect) => {
                const isSelected = selectedSuspectId === suspect.id;
                return (
                  <div
                    key={suspect.id}
                    onClick={() => setSelectedSuspectId(suspect.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-red-500/20 border-red-500 shadow-md shadow-red-950/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white">{suspect.name}</h4>
                      <p className="text-xs font-mono text-amber-400/90">{suspect.role}</p>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'bg-red-500 border-red-400 text-white' : 'border-slate-700'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rationale Textarea */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-bold mb-2">
              2. Investigator's Deductive Rationale:
            </label>
            <textarea
              rows={3}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Outline the critical evidence, contradictions in their alibi, or motive that proves their guilt..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            ></textarea>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-mono font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel & Review Evidence
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg text-xs font-mono font-bold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-lg shadow-red-900/30 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting Warrant...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  Lock In Accusation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
