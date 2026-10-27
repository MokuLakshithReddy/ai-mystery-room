import React from 'react';
import { Fingerprint, Search, ShieldAlert, Cpu } from 'lucide-react';

export default function Loader({ message = "Analyzing forensic data...", submessage = "Consulting AI intelligence engine" }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="relative w-24 h-24 mb-6">
        {/* Outer glowing pulsing ring */}
        <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 animate-ping"></div>
        <div className="absolute inset-0 rounded-full border border-amber-500/40 animate-pulse"></div>
        
        {/* Core rotating badge */}
        <div className="absolute inset-2 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-inner">
          <Fingerprint className="w-10 h-10 text-amber-400 animate-pulse" />
        </div>

        {/* Scanner radar beam */}
        <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent scanner-beam opacity-75"></div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-white tracking-wide mb-1 flex items-center gap-2">
        <Search className="w-4 h-4 text-amber-400 animate-bounce" />
        {message}
      </h3>
      <p className="text-xs font-mono text-slate-400 max-w-sm">
        {submessage}
      </p>
    </div>
  );
}
