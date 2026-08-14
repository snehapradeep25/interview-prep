import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, RotateCcw, ArrowRight, Lightbulb, Edit3 } from 'lucide-react';

interface PreparationScreenProps {
  topicTitle: string;
  topicCategory?: string;
  prepMinutes: number;
  onFinishPreparation: () => void;
  onCancel: () => void;
}

export const PreparationScreen: React.FC<PreparationScreenProps> = ({
  topicTitle,
  topicCategory,
  prepMinutes,
  onFinishPreparation,
  onCancel
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(prepMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [userNotes, setUserNotes] = useState<string>('');

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsRunning(false);
      onFinishPreparation();
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, onFinishPreparation]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setSecondsLeft(prepMinutes * 60);
    setIsRunning(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-semibold">
          <Clock className="w-4 h-4 text-pink-400" />
          <span>Preparation Phase</span>
        </div>
        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
          Organize Your Thoughts
        </h2>
        <p className="text-gray-400 text-sm">
          Preparation time assigned based on topic difficulty. Think before speaking!
        </p>
      </div>

      <div className="bg-[#131622] rounded-3xl p-6 sm:p-8 border border-pink-500/30 anime-glow-pink space-y-4 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

        {topicCategory && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-gray-300">
            {topicCategory}
          </span>
        )}

        <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white leading-snug">
          “{topicTitle}”
        </h3>

        <div className="py-6 flex flex-col items-center justify-center">
          <div className="font-mono-header text-6xl sm:text-7xl font-extrabold tracking-wider bg-gradient-to-r from-pink-400 via-purple-300 to-white bg-clip-text text-transparent">
            {formatTime(secondsLeft)}
          </div>
          <span className="text-xs text-gray-400 mt-2 font-mono">Preparation Remaining</span>

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-all"
            >
              {isRunning ? <Pause className="w-4 h-4 text-pink-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
              <span>{isRunning ? 'Pause' : 'Resume'}</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold border border-white/10 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
              <span>Reset Timer</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#131622] rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
            <Lightbulb className="w-4 h-4" />
            <span>Recommended Structure:</span>
          </div>

          <ul className="space-y-3 text-xs sm:text-sm text-gray-300">
            <li className="flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <span><strong>State your opinion clearly:</strong> Begin with a direct stance or thesis statement.</span>
            </li>
            <li className="flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <span><strong>Identify 2 main points:</strong> Outline the two primary reasons supporting your opinion.</span>
            </li>
            <li className="flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <span><strong>Add a quick example:</strong> Mention a real project, story, or practical scenario.</span>
            </li>
            <li className="flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center text-xs font-bold shrink-0">4</span>
              <span><strong>Direct conclusion:</strong> Summarize your main takeaway in 1 sentence.</span>
            </li>
          </ul>
        </div>

        <div className="bg-[#131622] rounded-2xl p-6 border border-white/10 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-2">
              <Edit3 className="w-4 h-4" />
              <span>Optional Scratch Notes:</span>
            </div>
            <textarea
              value={userNotes}
              onChange={e => setUserNotes(e.target.value)}
              placeholder="Jot down key bullet points to remember while speaking..."
              rows={6}
              className="w-full bg-[#0d0f18] rounded-xl p-3.5 text-xs text-gray-200 border border-white/10 focus:border-pink-500 outline-none resize-none font-mono"
            />
          </div>
          <span className="text-[11px] text-gray-500">
            Notes are for your eyes only during preparation.
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-semibold border border-white/10"
        >
          Exit Session
        </button>

        <button
          onClick={onFinishPreparation}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-pink-500/30 transition-all hover:scale-105"
        >
          <span>I'm Ready to Speak</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
