import React from 'react';
import type { SpeakingDuration, PracticeMode } from '../types';
import { Clock, Mic, Volume2, Sparkles, Shield, ArrowRight, Zap } from 'lucide-react';

interface SpeakingConfigProps {
  topicTitle: string;
  selectedDuration: SpeakingDuration;
  selectedMode: PracticeMode;
  onSelectDuration: (d: SpeakingDuration) => void;
  onSelectMode: (m: PracticeMode) => void;
  onStartSpeaking: () => void;
  onCancel: () => void;
}

export const SpeakingConfig: React.FC<SpeakingConfigProps> = ({
  topicTitle,
  selectedDuration,
  selectedMode,
  onSelectDuration,
  onSelectMode,
  onStartSpeaking,
  onCancel
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 text-[#e0f2fe]">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-cyan-300 text-xs font-semibold">
          <Mic className="w-4 h-4 text-cyan-400" />
          <span>Speaking Session Setup</span>
        </div>
        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
          Configure Your Speaking Test
        </h2>
        <p className="text-gray-400 text-sm">
          Select speaking duration and your preferred recording feedback level.
        </p>
      </div>

      <div className="bg-[#111622] rounded-2xl p-4 sm:p-5 border border-blue-500/20 text-center">
        <span className="text-[11px] font-mono-header text-cyan-400 font-bold uppercase tracking-wider">Target Topic</span>
        <h3 className="font-heading font-bold text-lg text-white mt-1">“{topicTitle}”</h3>
      </div>

      <div className="space-y-3">
        <label className="font-heading font-bold text-base text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>1. How long do you want to speak?</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {([1, 2, 3] as SpeakingDuration[]).map(duration => (
            <div
              key={duration}
              onClick={() => onSelectDuration(duration)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedDuration === duration
                  ? 'bg-blue-600/20 border-cyan-400 anime-glow-cyan scale-102'
                  : 'bg-[#111622] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono-header font-extrabold text-2xl text-white">{duration} Min</span>
                {duration === 1 && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-cyan-300 font-bold">DEFAULT</span>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {duration === 1 && 'Short, quick, and concise response.'}
                {duration === 2 && 'More detailed answer with supporting points.'}
                {duration === 3 && 'Comprehensive response / deep interview simulation.'}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-4">
        <label className="font-heading font-bold text-base text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>2. How do you want to practice?</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => onSelectMode('AI_ANALYSIS')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
              selectedMode === 'AI_ANALYSIS'
                ? 'bg-blue-600/20 border-cyan-400 anime-glow-cyan scale-102'
                : 'bg-[#111622] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>AI ANALYSIS</span>
              </div>
              <p className="text-xs text-gray-300">
                Record your voice and receive instant detailed AI analysis on fluency, grammar, filler words, and an improved answer.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-cyan-300 flex items-center gap-1 font-medium">
              <Mic className="w-3.5 h-3.5" />
              <span>Mic required • Full AI feedback</span>
            </div>
          </div>

          <div
            onClick={() => onSelectMode('RECORD_ONLY')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
              selectedMode === 'RECORD_ONLY'
                ? 'bg-blue-500/20 border-blue-500 scale-102'
                : 'bg-[#111622] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                <Zap className="w-4 h-4" />
                <span>RECORD ONLY</span>
              </div>
              <p className="text-xs text-gray-300">
                Record your voice to listen back and review yourself. Zero AI processing or API calls.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-blue-300 flex items-center gap-1 font-medium">
              <Mic className="w-3.5 h-3.5" />
              <span>Mic required • Self review</span>
            </div>
          </div>

          <div
            onClick={() => onSelectMode('NO_RECORDING')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
              selectedMode === 'NO_RECORDING'
                ? 'bg-emerald-500/20 border-emerald-500 scale-102'
                : 'bg-[#111622] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Volume2 className="w-4 h-4" />
                <span>NO RECORDING</span>
              </div>
              <p className="text-xs text-gray-300">
                Practice speaking freely out loud with the live timer. Microphone is never accessed or recorded.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-emerald-300 flex items-center gap-1 font-medium">
              <Shield className="w-3.5 h-3.5" />
              <span>No Mic • 100% Private</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-semibold border border-white/10"
        >
          Cancel
        </button>

        <button
          onClick={onStartSpeaking}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
        >
          <span>Start Speaking Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
