import React from 'react';
import { FileText, Sparkles, Volume2, ArrowRight, Zap, RotateCw } from 'lucide-react';

interface HeroHomeProps {
  onStartResumeInterview: () => void;
}

export const HeroHome: React.FC<HeroHomeProps> = ({
  onStartResumeInterview
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-12 select-none text-[#e0f2fe]">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-cyan-300 text-xs font-semibold shadow-inner">
          <RotateCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span>Resume Spin Wheel Interview Generator</span>
        </div>

        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
          Master interview questions <br />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-white bg-clip-text text-transparent">
            extracted from your resume
          </span>
        </h1>

        <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Spin the wheel with soft audio feedback to draw surface-level or deep technical research questions extracted directly from your resume.
        </p>
      </div>

      {/* RESUME INTERVIEW SPIN WHEEL (SOLE FOCUS) */}
      <div 
        onClick={onStartResumeInterview}
        className="group relative bg-[#111622] rounded-3xl p-8 sm:p-12 anime-card-border cursor-pointer flex flex-col justify-between overflow-hidden border border-blue-500/40 hover:border-cyan-400/80 shadow-2xl shadow-blue-950/40 anime-glow-blue"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl group-hover:bg-blue-500/35 transition-all duration-300 pointer-events-none" />

        <div className="space-y-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/30 to-cyan-500/30 border border-blue-500/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <FileText className="w-8 h-8 text-cyan-300" />
          </div>

          <div className="space-y-2">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-mono-header font-bold text-cyan-300 bg-blue-500/20 border border-blue-500/30">
              RESUME SPIN WHEEL
            </div>
            <h3 className="font-heading text-3xl sm:text-4xl font-extrabold text-white group-hover:text-cyan-300 transition-colors">
              Launch Resume Question Wheel
            </h3>
            <p className="text-gray-300 text-base leading-relaxed max-w-2xl">
              Upload your resume (PDF/DOCX/TXT) or test with a sample profile. Draw <strong>"Off the cuff"</strong> (surface-level) and <strong>"Deep research"</strong> (deep technical breakdown) questions with real sound effects.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/10 relative z-10">
          <span className="text-xs text-cyan-300/80 font-medium">100% Grounded in your experience • Surface & Deep Questions</span>
          <button className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-xl shadow-blue-500/30 group-hover:scale-105 transition-all">
            <span>Spin Resume Wheel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-[#0b0e17] rounded-2xl p-6 sm:p-8 border border-blue-500/20 space-y-6 max-w-4xl mx-auto">
        <div className="text-center space-y-1">
          <h4 className="font-heading font-bold text-lg text-white">
            Choose how you want to practice — Zero pressure
          </h4>
          <p className="text-xs text-gray-400">
            You are always in control of your privacy and recording settings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#111622] p-4 rounded-xl border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
              <Volume2 className="w-4 h-4" />
              <span>Level 1: Just Speak</span>
            </div>
            <p className="text-xs text-gray-400">
              No recording, no microphone access required. Pure preparation and timer practice.
            </p>
          </div>

          <div className="bg-[#111622] p-4 rounded-xl border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
              <Zap className="w-4 h-4" />
              <span>Level 2: Record Only</span>
            </div>
            <p className="text-xs text-gray-400">
              Record your voice to listen back and self-evaluate. Zero AI processing or API calls.
            </p>
          </div>

          <div className="bg-[#111622] p-4 rounded-xl border border-blue-500/30 space-y-2 relative overflow-hidden">
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono-header bg-blue-500/20 text-cyan-300">
              RECOMMENDED
            </div>
            <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Level 3: AI Analysis</span>
            </div>
            <p className="text-xs text-gray-400">
              Receive detailed AI feedback on fluency, grammar, vocabulary, filler words, and improved answers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
