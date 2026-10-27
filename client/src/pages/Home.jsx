import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles, ShieldAlert, Award, FileText, ArrowRight, Brain, Lock, CheckCircle2, Skull } from 'lucide-react';
import { getCases } from '../services/api';

export default function Home() {
  const [recentCases, setRecentCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(true);

  useEffect(() => {
    async function fetchRecent() {
      try {
        const res = await getCases();
        setRecentCases(res.data?.cases || []);
      } catch (err) {
        console.error('Failed to load recent cases:', err);
      } finally {
        setLoadingCases(false);
      }
    }
    fetchRecent();
  }, []);

  const samplePremises = [
    {
      title: "The Midnight Gala Cyanide Toast",
      genre: "High Society Poisoning",
      difficulty: "Medium",
      color: "border-amber-500/30 text-amber-400 bg-amber-500/10",
      description: "A billionaire collapses during his anniversary speech. The champagne flute smells of bitter almonds and the conservatory lights were cut."
    },
    {
      title: "Sabotage at Neon Heights Penthouse",
      genre: "Cyber Heist & Homicide",
      difficulty: "Hard",
      color: "border-red-500/30 text-red-400 bg-red-500/10",
      description: "An AI architect is severed inside a hermetically sealed server chamber. Security feeds wiped for exactly 180 seconds."
    },
    {
      title: "The Missing Venetian Diamond",
      genre: "Museum Grand Larceny",
      difficulty: "Easy",
      color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
      description: "A priceless 100-carat blue diamond vanishes during a thunderstorm. Lasers remained active, yet the glass case is unblemished."
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 overflow-hidden">
        {/* Ambient atmospheric glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto text-center space-y-6 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-amber-500/30 text-amber-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            POWERED BY GEMINI GENERATIVE INTELLIGENCE
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            EVERY CLUE TELLS A STORY.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-red-400">
              CAN YOU CRACK THE CASE?
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Step into the shoes of a lead investigator. Interrogate suspects, inspect crime scenes for forensic evidence, leverage hints, and formally identify the culprit before they escape justice.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/create"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-mono text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
              Start New Investigation
            </Link>

            <a
              href="#recent-cases"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-mono text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              View Case Archives
            </a>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 w-fit mb-4">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Procedural Gemini AI Stories</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every mystery is synthesized on demand with logically consistent alibis, physical evidence, and fair-play whodunit rules.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 w-fit mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Zero-Spoiler Backend Security</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The culprit identity and solution explanation remain locked on the backend. No inspect-element cheating—pure deduction only.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Real-time Score Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Earn +5 points for every discovered clue, lose 10 points for forensic hints, and claim the base bounty for capturing the true culprit.
            </p>
          </div>
        </div>
      </section>

      {/* Sample Mystery Scenarios Carousel */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Case File Dossier Samples</h2>
            <p className="text-xs text-slate-400 font-mono">Popular mystery archetypes ready to investigate</p>
          </div>
          <Link to="/create" className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1">
            Launch generator <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {samplePremises.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border ${item.color}`}>
                    {item.difficulty}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    {item.genre}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <Link
                to={`/create?premise=${encodeURIComponent(item.title)}&difficulty=${item.difficulty.toLowerCase()}`}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition-colors text-center flex items-center justify-center gap-1.5"
              >
                Investigate This Scenario
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Investigations Archive */}
      <section id="recent-cases" className="max-w-6xl mx-auto px-4">
        <div className="border-t border-slate-800 pt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                Recent Case Files Log
              </h2>
              <p className="text-xs text-slate-400 font-mono">Archived and ongoing detective investigations</p>
            </div>
          </div>

          {loadingCases ? (
            <div className="text-center py-10 text-xs font-mono text-slate-500">
              Loading recent case files...
            </div>
          ) : recentCases.length === 0 ? (
            <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
              <Skull className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400 font-medium">No open cases logged yet.</p>
              <Link
                to="/create"
                className="inline-block text-xs font-mono font-bold text-amber-400 hover:underline"
              >
                Create the agency's very first investigation →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentCases.map((c) => (
                <Link
                  key={c._id}
                  to={c.status === 'completed' ? `/case/${c._id}/result` : `/case/${c._id}`}
                  className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        c.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}>
                        {c.status === 'completed' ? 'CLOSED' : 'ACTIVE'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        {c.difficulty}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                      {c.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {c.story?.synopsis || c.premise}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                    <span>Score: <strong className="text-amber-400">{c.score?.totalScore || 0} pts</strong></span>
                    <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform">Resume →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
