import React from 'react';
import { Sparkles, Mic, RefreshCw, Shield } from 'lucide-react';

interface HeaderProps {
  onGoHome: () => void;
  currentStep: string;
}

export const Header: React.FC<HeaderProps> = ({ onGoHome, currentStep }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#07090e]/90 backdrop-blur-md border-b border-blue-500/20 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      <div 
        onClick={onGoHome}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 p-[1.5px] shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
          <div className="w-full h-full bg-[#07090e] rounded-[10.5px] flex items-center justify-center">
            <Mic className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-300 via-cyan-200 to-white bg-clip-text text-transparent">
              Komi<span className="text-cyan-400">AI</span>
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono-header font-bold text-cyan-300 bg-blue-500/10 border border-blue-500/30 rounded">
              古見
            </span>
          </div>
          <p className="text-[11px] text-gray-400 font-medium hidden sm:block">
            Speak better. Answer smarter. Get interview-ready.
          </p>
        </div>
      </div>

      {currentStep !== 'HOME' && (
        <button 
          onClick={onGoHome}
          className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-blue-500/40 text-xs font-medium text-gray-300 hover:text-white transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Exit to Dashboard</span>
        </button>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          <Shield className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">100% Private Session</span>
          <span className="sm:hidden">Private</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Resume Wheel</span>
        </div>
      </div>
    </header>
  );
};
