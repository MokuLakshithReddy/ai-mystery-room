import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCaseResult } from '../services/api';
import Loader from '../components/Loader';
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Lock, 
  Unlock, 
  FileCheck, 
  ArrowRight, 
  RotateCcw, 
  Sparkles,
  User,
  Shield,
  HelpCircle
} from 'lucide-react';

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseResult, setCaseResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadResult() {
      try {
        setLoading(true);
        const res = await getCaseResult(id);
        setCaseResult(res.data);
      } catch (err) {
        console.error('Failed to load result:', err);
        setError(err.response?.data?.error || 'Case result not available yet or case is still active.');
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 max-w-xl mx-auto px-4">
        <Loader message="DECLASSIFYING OFFICIAL CASE VERDICT..." submessage="Unsealing judicial records and solution archives..." />
      </div>
    );
  }

  if (error || !caseResult) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-sm font-mono">
          {error}
        </div>
        <Link
          to={`/case/${id}`}
          className="inline-block px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold transition-all"
        >
          Return to Active Investigation
        </Link>
      </div>
    );
  }

  const { case: caseData, verdict } = caseResult;
  const isCorrect = verdict?.isCorrect;
  const score = verdict?.score || caseData?.score || { basePoints: 0, clueBonus: 0, hintPenalty: 0, totalScore: 0 };

  // Calculate Detective Rank based on final score
  const getRank = (pts) => {
    if (pts >= 180) return { title: "Grand Master Detective (Sherlock)", badge: "border-amber-400 text-amber-300 bg-amber-400/10" };
    if (pts >= 130) return { title: "Senior Inspector", badge: "border-emerald-400 text-emerald-300 bg-emerald-400/10" };
    if (pts >= 70) return { title: "Field Investigator", badge: "border-cyan-400 text-cyan-300 bg-cyan-400/10" };
    return { title: "Rookie Sleuth", badge: "border-slate-500 text-slate-300 bg-slate-500/10" };
  };

  const rank = getRank(score.totalScore);
  const accusedSuspect = caseData.suspects?.find(s => s.id === caseData.playerAccusation?.accusedSuspectId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Verdict Announcement Banner */}
      <div className={`p-8 rounded-2xl border relative overflow-hidden backdrop-blur-md shadow-2xl ${
        isCorrect
          ? 'bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border-emerald-500/50 shadow-emerald-950/30'
          : 'bg-gradient-to-br from-red-950/80 via-slate-900 to-slate-900 border-red-500/50 shadow-red-950/30'
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-center md:text-left">
            <div className={`p-4 rounded-2xl border ${
              isCorrect
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-red-500/20 border-red-500/40 text-red-400'
            }`}>
              {isCorrect ? (
                <CheckCircle className="w-12 h-12" />
              ) : (
                <XCircle className="w-12 h-12" />
              )}
            </div>

            <div>
              <span className="text-xs font-mono font-bold tracking-widest uppercase block mb-1 text-slate-400">
                OFFICIAL JUDICIAL VERDICT
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {isCorrect ? 'CASE CLOSED: CULPRIT CAUGHT!' : 'CASE UNSOLVED: INNOCENT ACCUSED!'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                {isCorrect 
                  ? 'Your deductive reasoning held true. The real perpetrator was brought to justice.'
                  : `You formally accused ${accusedSuspect?.name || 'the wrong suspect'}. The true mastermind escaped!`}
              </p>
            </div>
          </div>

          {/* Stamp Badge */}
          <div className="shrink-0">
            {isCorrect ? (
              <div className="solved-stamp font-mono">
                JUSTICE SERVED
              </div>
            ) : (
              <div className="classified-stamp font-mono">
                COLD CASE
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scorecard & Detective Rank */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Score Summary */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Final Investigation Score
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-amber-400 font-mono">
                {score.totalScore}
              </span>
              <span className="text-sm font-mono text-slate-400">pts</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
              Honorary Investigator Rank
            </span>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-bold border ${rank.badge}`}>
              {rank.title}
            </span>
          </div>
        </div>

        {/* Detailed Points Ledger */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Investigator Scoring Ledger
          </h3>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-300 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                Accusation Accuracy Bounty ({caseData.difficulty?.toUpperCase()} Tier)
              </span>
              <span className={score.basePoints > 0 ? "text-emerald-400 font-bold" : "text-slate-500"}>
                +{score.basePoints} pts
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-300 flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-400" />
                Evidence Discovery Bonus (+5 per clue examined)
              </span>
              <span className="text-emerald-400 font-bold">
                +{score.clueBonus} pts
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-slate-300 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-red-400" />
                Forensic Intelligence Penalty (-10 per hint used)
              </span>
              <span className={score.hintPenalty > 0 ? "text-red-400 font-bold" : "text-slate-500"}>
                -{score.hintPenalty} pts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* The Classified Solution Declassified */}
      <div className="p-8 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Unlock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              DECLASSIFIED CASE SOLUTION & CONFESSION
            </h3>
            <p className="text-xs font-mono text-slate-400">
              Full forensic breakdown and crime reconstruction
            </p>
          </div>
        </div>

        {/* Culprit Dossier */}
        <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 font-bold text-xl">
              <User className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-red-400 uppercase font-bold tracking-wider block">
                The True Perpetrator
              </span>
              <h4 className="text-lg font-black text-white">
                {verdict?.culprit?.name}
              </h4>
              <p className="text-xs font-mono text-amber-400/90">
                Identified as culprit by forensic evidence
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Your Accusation: <strong className={isCorrect ? "text-emerald-400" : "text-red-400"}>
              {accusedSuspect?.name || caseData.playerAccusation?.accusedSuspectId}
            </strong>
          </div>
        </div>

        {/* Motive Explanation */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
            The Motive:
          </h4>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800 font-sans">
            {verdict?.motiveExplanation}
          </p>
        </div>

        {/* Crime Breakdown */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
            The Execution & Logical Proof Trail:
          </h4>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800 font-sans whitespace-pre-line">
            {verdict?.solutionBreakdown}
          </p>
        </div>

        {/* Player Rationale Archive */}
        {caseData.playerAccusation?.rationale && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              Investigator's Filed Deposition:
            </h4>
            <p className="text-xs text-slate-400 italic bg-slate-950/40 p-3 rounded-lg border border-slate-800">
              "{caseData.playerAccusation.rationale}"
            </p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          to="/create"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-mono text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Investigate Another Mystery
        </Link>

        <Link
          to="/"
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-mono text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-center"
        >
          Return to Command Desk
        </Link>
      </div>
    </div>
  );
}
