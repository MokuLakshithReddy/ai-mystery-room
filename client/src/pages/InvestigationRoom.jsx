import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getCaseById, 
  discoverClue, 
  requestHint, 
  submitAccusation 
} from '../services/api';
import ScoreBadge from '../components/ScoreBadge';
import SuspectCard from '../components/SuspectCard';
import ClueCard from '../components/ClueCard';
import HintDrawer from '../components/HintDrawer';
import AccusationModal from '../components/AccusationModal';
import Loader from '../components/Loader';
import { 
  Users, 
  Search, 
  FileText, 
  HelpCircle, 
  Target, 
  Clock, 
  MapPin, 
  Skull, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export default function InvestigationRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active view tab: 'overview' | 'suspects' | 'clues'
  const [activeTab, setActiveTab] = useState('overview');

  // Accusation modal state
  const [isAccusationModalOpen, setIsAccusationModalOpen] = useState(false);
  const [targetSuspectId, setTargetSuspectId] = useState('');

  // Notification banner
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    async function loadCase() {
      try {
        setLoading(true);
        const res = await getCaseById(id);
        const data = res.data?.case;
        if (!data) throw new Error('Case file not found.');

        // If case is already completed, redirect to results page
        if (data.status === 'completed') {
          navigate(`/case/${id}/result`, { replace: true });
          return;
        }

        setCaseData(data);
      } catch (err) {
        console.error('Failed to load case:', err);
        setError(err.response?.data?.error || err.message || 'Failed to load case file.');
      } finally {
        setLoading(false);
      }
    }
    loadCase();
  }, [id, navigate]);

  // Clue discovery action
  const handleDiscoverClue = async (clueId) => {
    try {
      const res = await discoverClue(id, clueId);
      const updatedClue = res.data?.clue;
      const newScore = res.data?.currentScore;

      setCaseData((prev) => {
        if (!prev) return prev;
        const newClues = prev.clues.map((c) => (c.id === clueId ? updatedClue : c));
        return {
          ...prev,
          clues: newClues,
          score: {
            ...prev.score,
            totalScore: newScore ?? prev.score.totalScore
          }
        };
      });

      showNotification(`Clue discovered! +5 points added to your score.`);
    } catch (err) {
      console.error('Error discovering clue:', err);
      showNotification(err.response?.data?.error || 'Failed to analyze clue.', 'error');
    }
  };

  // Hint request action
  const handleRequestHint = async () => {
    try {
      const res = await requestHint(id);
      const updatedHint = res.data?.hint;
      const newScore = res.data?.currentScore;

      setCaseData((prev) => {
        if (!prev) return prev;
        const newHints = prev.hints.map((h) => (h.id === updatedHint.id ? updatedHint : h));
        return {
          ...prev,
          hints: newHints,
          score: {
            ...prev.score,
            totalScore: newScore ?? prev.score.totalScore
          }
        };
      });

      showNotification(`Forensic hint declassified (-10 points penalty applied).`, 'warning');
    } catch (err) {
      console.error('Error requesting hint:', err);
      showNotification(err.response?.data?.error || 'Failed to request hint.', 'error');
    }
  };

  // Formal Accusation Submission
  const handleSubmitAccusation = async ({ suspectId, rationale }) => {
    const res = await submitAccusation(id, { suspectId, rationale });
    setIsAccusationModalOpen(false);
    navigate(`/case/${id}/result`, { state: { verdict: res.data?.verdict } });
  };

  if (loading) {
    return (
      <div className="py-24 max-w-xl mx-auto px-4">
        <Loader message="OPENING CLASSIFIED CASE FILE..." submessage="Decrypting scene logs and forensic files..." />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-sm font-mono">
          {error || 'Case file does not exist.'}
        </div>
        <button
          onClick={() => navigate('/create')}
          className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold transition-all"
        >
          Initialize New Case
        </button>
      </div>
    );
  }

  const discoveredCount = caseData.clues.filter((c) => c.isDiscovered).length;
  const hintsUsed = caseData.hints.filter((h) => h.isUnlocked).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-28">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl border text-xs font-mono shadow-2xl flex items-center gap-2 animate-bounce ${
          notification.type === 'error'
            ? 'bg-red-950 border-red-500 text-red-200'
            : notification.type === 'warning'
            ? 'bg-amber-950 border-amber-500 text-amber-200'
            : 'bg-emerald-950 border-emerald-500 text-emerald-200'
        }`}>
          <Sparkles className="w-4 h-4" />
          {notification.msg}
        </div>
      )}

      {/* Case Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                ACTIVE CASE FILE #{caseData._id?.slice(-6).toUpperCase()}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {caseData.story?.crimeType || 'Homicide Investigation'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {caseData.title}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => {
              setTargetSuspectId(caseData.suspects[0]?.id || '');
              setIsAccusationModalOpen(true);
            }}
            className="self-start md:self-auto px-6 py-3 rounded-xl font-mono text-xs font-bold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-lg shadow-red-900/30 transition-all flex items-center gap-2 group"
          >
            <Target className="w-4 h-4 group-hover:scale-110 transition-transform" />
            File Formal Accusation
          </button>
        </div>

        {/* Real-time score & progress bar component */}
        <ScoreBadge
          score={caseData.score}
          cluesCount={caseData.clues.length}
          discoveredCount={discoveredCount}
          hintsUsed={hintsUsed}
          difficulty={caseData.difficulty}
        />
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-t-xl font-mono text-xs font-bold transition-all flex items-center gap-2 border-t border-x ${
            activeTab === 'overview'
              ? 'bg-slate-900 border-slate-700 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50'
          }`}
        >
          <FileText className="w-4 h-4" />
          Case Overview & Crime Scene
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('suspects')}
          className={`px-4 py-2.5 rounded-t-xl font-mono text-xs font-bold transition-all flex items-center gap-2 border-t border-x ${
            activeTab === 'suspects'
              ? 'bg-slate-900 border-slate-700 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50'
          }`}
        >
          <Users className="w-4 h-4" />
          Suspects Dossier ({caseData.suspects.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('clues')}
          className={`px-4 py-2.5 rounded-t-xl font-mono text-xs font-bold transition-all flex items-center gap-2 border-t border-x ${
            activeTab === 'clues'
              ? 'bg-slate-900 border-slate-700 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/50'
          }`}
        >
          <Search className="w-4 h-4" />
          Crime Scene Clues ({discoveredCount}/{caseData.clues.length})
        </button>
      </div>

      {/* Tab 1: Case Overview & Setting */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Story Narrative */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Initial Incident & Dispatch Synopsis
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed font-sans bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              {caseData.story?.synopsis}
            </p>

            {/* Premise reminder */}
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs">
              <span className="font-mono font-bold text-amber-400 block mb-1 uppercase tracking-wider">
                Investigator Case Objective:
              </span>
              <p className="text-slate-300">
                Identify which of the {caseData.suspects.length} suspects had the means, motive, and opportunity. Cross-reference their stated alibis with physical evidence gathered from the scene.
              </p>
            </div>
          </div>

          {/* Quick Scene Intel Box */}
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider mb-2">
                Crime Scene Parameters
              </h3>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                  <Skull className="w-3.5 h-3.5 text-red-400" />
                  <span className="font-semibold text-[10px] uppercase">Victim</span>
                </div>
                <p className="text-white font-bold">{caseData.story?.victim}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold text-[10px] uppercase">Primary Location</span>
                </div>
                <p className="text-slate-200">{caseData.story?.crimeScene}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-semibold text-[10px] uppercase">Estimated Time of Crime</span>
                </div>
                <p className="text-slate-200">{caseData.story?.timeOfCrime}</p>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 space-y-3 text-center">
              <p className="text-xs font-mono text-amber-300">
                Found suspicious evidence?
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('clues')}
                className="w-full py-2.5 rounded-xl font-mono text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
              >
                Inspect Crime Scene Clues →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Suspects Lineup */}
      {activeTab === 'suspects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Suspects Under Investigation</h3>
              <p className="text-xs text-slate-400 font-mono">
                Compare motives, alibis, and relationships to victim
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400">
              {caseData.suspects.length} Persons of Interest
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {caseData.suspects.map((suspect) => (
              <SuspectCard
                key={suspect.id}
                suspect={suspect}
                isSelected={targetSuspectId === suspect.id}
                onSelect={() => setTargetSuspectId(suspect.id)}
                onQuickAccuse={(s) => {
                  setTargetSuspectId(s.id);
                  setIsAccusationModalOpen(true);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Clues Discovery */}
      {activeTab === 'clues' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Crime Scene Evidence Log</h3>
              <p className="text-xs text-slate-400 font-mono">
                Click unexamined sectors to analyze physical forensic traces (+5 pts each)
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {discoveredCount} / {caseData.clues.length} Cataloged
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {caseData.clues.map((clue) => (
              <ClueCard
                key={clue.id}
                clue={clue}
                onDiscover={handleDiscoverClue}
              />
            ))}
          </div>
        </div>
      )}

      {/* Forensic Intelligence Hints Drawer */}
      <HintDrawer
        hints={caseData.hints}
        onRequestHint={handleRequestHint}
      />

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-slate-950/90 border-t border-slate-800 backdrop-blur-md shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <span className="text-xs font-mono font-bold text-white block">
              Case Status: Investigation Active
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {discoveredCount} clues examined • Current Score: <strong className="text-amber-400">{caseData.score?.totalScore || 0} pts</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!targetSuspectId && caseData.suspects.length > 0) {
                setTargetSuspectId(caseData.suspects[0].id);
              }
              setIsAccusationModalOpen(true);
            }}
            className="w-full sm:w-auto px-8 py-3 rounded-xl font-mono text-xs font-bold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-xl shadow-red-900/40 transition-all flex items-center justify-center gap-2 group"
          >
            <Target className="w-4 h-4 group-hover:scale-110 transition-transform" />
            File Official Suspect Accusation
          </button>
        </div>
      </div>

      {/* Accusation Modal */}
      <AccusationModal
        suspects={caseData.suspects}
        initialSelectedId={targetSuspectId}
        isOpen={isAccusationModalOpen}
        onClose={() => setIsAccusationModalOpen(false)}
        onSubmit={handleSubmitAccusation}
      />
    </div>
  );
}
