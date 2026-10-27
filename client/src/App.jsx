import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateMystery from './pages/CreateMystery';
import InvestigationRoom from './pages/InvestigationRoom';
import Results from './pages/Results';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col noir-grid selection:bg-amber-500 selection:text-slate-950">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateMystery />} />
            <Route path="/case/:id" element={<InvestigationRoom />} />
            <Route path="/case/:id/result" element={<Results />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs font-mono text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>AI Mystery Room • Powered by Google Gemini Generative AI</span>
            <span>Zero-Knowledge Proof & Sealed Solution Security Architecture</span>
          </div>
        </footer>
      </div>
    </Router>
  );
}
