import React, { useEffect } from 'react';
import type { AIFeedbackResponse } from '../types';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  BookOpen, 
  MessageSquare, 
  ArrowRight, 
  Volume2, 
  ThumbsUp, 
  Flame,
  Award
} from 'lucide-react';

interface FeedbackScreenProps {
  topicTitle: string;
  actualSpeakingSeconds: number;
  practiceMode: 'NO_RECORDING' | 'RECORD_ONLY' | 'AI_ANALYSIS';
  audioUrl: string | null;
  feedback: AIFeedbackResponse | null;
  onTryResume: () => void;
}

export const FeedbackScreen: React.FC<FeedbackScreenProps> = ({
  topicTitle,
  actualSpeakingSeconds,
  practiceMode,
  audioUrl,
  feedback,
  onTryResume
}) => {


  useEffect(() => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  if (practiceMode === 'NO_RECORDING') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-8 select-none text-[#e0f2fe]">
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="font-heading font-extrabold text-3xl text-white">Practice Complete!</h2>
          <p className="text-gray-400 text-sm">
            You completed your speaking challenge out loud for <strong>{actualSpeakingSeconds} seconds</strong>.
          </p>
        </div>

        <div className="bg-[#111622] rounded-2xl p-6 border border-blue-500/20 text-left space-y-3 shadow-xl">
          <span className="text-[11px] font-mono-header text-emerald-400 font-bold uppercase">Topic Practiced</span>
          <p className="font-heading font-bold text-lg text-white">“{topicTitle}”</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={onTryResume}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-500/30"
          >
            Practice Another Question
          </button>
        </div>
      </div>
    );
  }

  if (practiceMode === 'RECORD_ONLY') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-8 select-none text-[#e0f2fe]">
        <div className="w-20 h-20 rounded-3xl bg-blue-500/20 text-cyan-400 flex items-center justify-center mx-auto border border-blue-500/40">
          <Volume2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="font-heading font-extrabold text-3xl text-white">Recording Saved & Ready!</h2>
          <p className="text-gray-400 text-sm">
            Listen back to evaluate your own tone, pace, and clarity.
          </p>
        </div>

        <div className="bg-[#111622] rounded-2xl p-6 border border-blue-500/30 text-left space-y-4 shadow-xl">
          <div>
            <span className="text-[11px] font-mono-header text-cyan-400 font-bold uppercase">Topic Practiced</span>
            <p className="font-heading font-bold text-lg text-white mt-1">“{topicTitle}”</p>
            <p className="text-xs text-gray-400 mt-1">Spoke for {actualSpeakingSeconds} seconds</p>
          </div>

          {audioUrl && (
            <div className="pt-3 border-t border-white/10">
              <label className="text-xs font-bold text-gray-300 block mb-2">Audio Playback:</label>
              <audio controls src={audioUrl} className="w-full" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={onTryResume}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-500/30"
          >
            Practice Another Question
          </button>
        </div>
      </div>
    );
  }

  if (!feedback) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10 text-[#e0f2fe]">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-[#111622] rounded-3xl p-6 sm:p-8 border border-blue-500/40 anime-glow-blue shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>KomiAI Speaking Report</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            “{topicTitle}”
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Speaking duration: {actualSpeakingSeconds} seconds
          </p>

          {audioUrl && (
            <div className="pt-3">
              <audio controls src={audioUrl} className="max-w-md h-9" />
            </div>
          )}
        </div>

        <div className="bg-[#07090e] p-6 rounded-2xl border border-blue-500/40 text-center shrink-0 w-full md:w-auto">
          <span className="text-[11px] font-mono-header text-gray-400 font-bold uppercase block mb-1">Overall AI Score</span>
          <div className="font-mono-header text-5xl font-black text-white bg-gradient-to-r from-blue-400 via-cyan-300 to-white bg-clip-text text-transparent">
            {feedback.overallScore} <span className="text-lg text-gray-500 font-normal">/ 100</span>
          </div>
          <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-cyan-300">
            {feedback.overallScore >= 80 ? '🌟 Excellent Fluency' : feedback.overallScore >= 70 ? '👍 Strong Effort' : '📈 Good Foundation'}
          </span>
        </div>
      </div>

      <div className="bg-[#111622] rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-xl">
        <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-cyan-400" />
          <span>Performance Metrics Breakdown</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Object.entries(feedback.scores).map(([metric, score]) => (
            <div key={metric} className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-300 capitalize">{metric}</span>
                <span className="font-mono font-bold text-cyan-300">{score}%</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${score}%` }} 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    score >= 80 ? 'bg-gradient-to-r from-blue-600 to-cyan-400' : 'bg-amber-500'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111622] rounded-2xl p-6 border border-emerald-500/30 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
            <ThumbsUp className="w-5 h-5" />
            <span>What You Did Well</span>
          </div>

          <ul className="space-y-3 text-xs sm:text-sm text-gray-300">
            {feedback.strengths.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#111622] rounded-2xl p-6 border border-cyan-500/30 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-base">
            <Flame className="w-5 h-5" />
            <span>Key Areas to Improve</span>
          </div>

          <ul className="space-y-3 text-xs sm:text-sm text-gray-300">
            {feedback.improvements.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                <AlertTriangle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-[#111622] rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <span>Spoken Transcript & Filler Word Analysis</span>
          </h3>

          <div className="flex items-center gap-2">
            {feedback.fillerWords.map((fw, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-cyan-300 border border-blue-500/30">
                "{fw.word}": {fw.count}x
              </span>
            ))}
          </div>
        </div>

        <div className="bg-[#07090e] p-5 rounded-2xl border border-blue-500/20 text-sm text-gray-200 leading-relaxed font-mono">
          “{feedback.transcript}”
        </div>
      </div>

      {feedback.grammarCorrections.length > 0 && (
        <div className="bg-[#111622] rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4 shadow-xl">
          <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span>Grammar Corrections</span>
          </h3>

          <div className="space-y-3">
            {feedback.grammarCorrections.map((item, i) => (
              <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2 text-xs sm:text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 text-rose-300">
                    <span className="font-bold text-[10px] uppercase text-rose-400 block mb-0.5">What you said:</span>
                    “{item.original}”
                  </div>

                  <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-emerald-300">
                    <span className="font-bold text-[10px] uppercase text-emerald-400 block mb-0.5">Better version:</span>
                    “{item.corrected}”
                  </div>
                </div>

                <p className="text-gray-400 text-xs italic pt-1">💡 {item.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-blue-950/40 via-cyan-950/30 to-[#111622] rounded-3xl p-6 sm:p-8 border border-blue-500/40 anime-glow-blue space-y-4 shadow-2xl">
        <div className="flex items-center gap-2 text-cyan-300 font-bold text-lg">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span>KomiAI Model Answer — Natural & Confident</span>
        </div>

        <p className="text-xs text-gray-400">
          This preserves your exact meaning and facts while phrasing them with natural, fluent English.
        </p>

        <div className="bg-[#07090e] p-6 rounded-2xl border border-blue-500/30 text-sm sm:text-base text-gray-100 font-medium leading-relaxed shadow-inner">
          “{feedback.improvedAnswer}”
        </div>
      </div>

      <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-center space-y-1">
        <span className="text-[11px] font-mono-header text-cyan-400 font-bold uppercase">💡 Next Challenge Recommendation</span>
        <p className="font-heading font-bold text-base text-white">{feedback.nextTip}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
        <button
          onClick={onTryResume}
          className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-500/30"
        >
          <span>Spin Resume Wheel Again</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
