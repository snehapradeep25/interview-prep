import React, { useState, useEffect } from 'react';
import type { Topic } from '../types';
import { TOPIC_DATABASE, getRandomTopics } from '../data/topics';
import { Dices, Clock, RefreshCw, ArrowRight } from 'lucide-react';

interface TopicShuffleProps {
  onSelectTopic: (topic: Topic) => void;
  onCancel: () => void;
}

export const TopicShuffle: React.FC<TopicShuffleProps> = ({ onSelectTopic, onCancel }) => {
  const [shuffling, setShuffling] = useState<boolean>(true);
  const [candidateTopics, setCandidateTopics] = useState<Topic[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const startShuffle = () => {
    setShuffling(true);
    setSelectedTopic(null);
    const topics = getRandomTopics(6);
    setCandidateTopics(topics);

    let speed = 70;
    let iterations = 0;
    const maxIterations = 22;

    const runStep = () => {
      iterations++;
      setCurrentIndex(prev => (prev + 1) % topics.length);

      if (iterations < maxIterations) {
        speed += 12;
        setTimeout(runStep, speed);
      } else {
        setShuffling(false);
        const finalTopic = topics[iterations % topics.length];
        setSelectedTopic(finalTopic);
      }
    };

    setTimeout(runStep, speed);
  };

  useEffect(() => {
    startShuffle();
  }, []);

  const activeTopic = selectedTopic || candidateTopics[currentIndex] || TOPIC_DATABASE[0];

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Difficult':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'Advanced':
        return 'bg-pink-500/10 text-pink-400 border-pink-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 text-center">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-semibold">
          <Dices className="w-4 h-4 text-pink-400 animate-spin" />
          <span>Interactive Topic Wheel</span>
        </div>
        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
          {shuffling ? 'Shuffling Topics...' : 'Your Random Speaking Topic'}
        </h2>
        <p className="text-gray-400 text-sm">
          {shuffling ? 'Landing on a surprise challenge for you...' : 'Here is your practice challenge. Prepare your thoughts!'}
        </p>
      </div>

      <div className="relative min-h-[320px] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/10 to-indigo-500/5 rounded-3xl blur-xl" />

        <div className={`w-full max-w-xl bg-[#131622] rounded-3xl p-6 sm:p-10 border transition-all duration-300 relative z-10 shadow-2xl ${
          shuffling 
            ? 'border-pink-500/50 scale-98 animate-shimmer' 
            : 'border-pink-500/40 anime-glow-pink scale-100'
        }`}>
          <div className="flex items-center justify-between gap-3 mb-6">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-gray-300">
              {activeTopic.category}
            </span>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyBadge(activeTopic.difficulty)}`}>
                {activeTopic.difficulty}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-pink-500/10 border border-pink-500/30 text-pink-300">
                <Clock className="w-3.5 h-3.5" />
                {activeTopic.prepMinutes}m Prep
              </span>
            </div>
          </div>

          <div className="my-6 min-h-[100px] flex items-center justify-center">
            <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white leading-snug">
              “{activeTopic.title}”
            </h3>
          </div>

          {activeTopic.description && !shuffling && (
            <p className="text-gray-400 text-xs sm:text-sm bg-white/5 p-3 rounded-xl border border-white/5">
              💡 <span className="font-medium text-gray-300">Prompt:</span> {activeTopic.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <button
          onClick={onCancel}
          disabled={shuffling}
          className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-semibold border border-white/10 transition-all disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          onClick={startShuffle}
          disabled={shuffling}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-sm font-semibold border border-purple-500/40 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${shuffling ? 'animate-spin' : ''}`} />
          <span>Spin Again</span>
        </button>

        <button
          onClick={() => selectedTopic && onSelectTopic(selectedTopic)}
          disabled={shuffling || !selectedTopic}
          className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-sm font-bold shadow-lg shadow-pink-500/30 transition-all disabled:opacity-50 hover:scale-105"
        >
          <span>Use This Topic</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
