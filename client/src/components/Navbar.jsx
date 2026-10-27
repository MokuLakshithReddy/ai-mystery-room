import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Search, FileQuestion, Sparkles, FolderLock } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isCaseActive = location.pathname.startsWith('/case/') && !location.pathname.endsWith('/result');

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 group-hover:border-amber-500/60 transition-colors">
              <Search className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                AI MYSTERY ROOM
                <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  v1.0
                </span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                Detective Investigation Agency
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/' 
                  ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Command Desk
            </Link>

            <Link
              to="/create"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-medium shadow-sm transition-all ${
                location.pathname === '/create'
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              New Case File
            </Link>

            {isCaseActive && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                ACTIVE INVESTIGATION
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
