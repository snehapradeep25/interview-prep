import React, { useState, useEffect } from 'react';
import type { ResumeData, ResumeQuestionItem, QuestionDepth, ResumeCategory } from '../types';
import { playTickSound, playLandChimeSound, unlockAudio, setSoundMuted } from '../services/soundEffects';

import { 
  Brain, 
  Search, 
  Bot, 
  RotateCw, 
  Timer, 
  Settings, 
  FileText, 
  Sparkles,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';

interface ResumeWheelDrawerProps {
  resumeData: ResumeData;
  onSelectQuestion: (questionText: string, item?: ResumeQuestionItem) => void;
  onStartTimer: (questionText: string, durationMinutes: number) => void;
  onChangeResume: () => void;
  onCancel: () => void;
}

export const ResumeWheelDrawer: React.FC<ResumeWheelDrawerProps> = ({
  resumeData,
  onSelectQuestion,
  onStartTimer,
  onChangeResume,
  onCancel
}) => {

  const [depth, setDepth] = useState<QuestionDepth>('SURFACE');
  const [selectedCategory, setSelectedCategory] = useState<ResumeCategory>('ALL');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [activeQuestion, setActiveQuestion] = useState<ResumeQuestionItem | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Timer & Sound settings
  const [speechMinutes, setSpeechMinutes] = useState<number>(1);
  const [researchMinutes, setResearchMinutes] = useState<number>(40);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const handleToggleMute = (muted: boolean) => {
    setIsMuted(muted);
    setSoundMuted(muted);
  };

  const questionBank = resumeData.questionBank || [];

  // Filter bank by depth & selected category
  const filteredQuestions = questionBank.filter(q => {
    const depthMatch = q.depth === depth;
    const catMatch = selectedCategory === 'ALL' || q.category === selectedCategory;
    return depthMatch && catMatch;
  });

  // Fallback if filter returns empty
  const activeQuestions = filteredQuestions.length > 0 
    ? filteredQuestions 
    : questionBank.filter(q => q.depth === depth);

  const currentItem = activeQuestion || activeQuestions[currentIndex % Math.max(1, activeQuestions.length)] || {
    id: 'fallback',
    text: 'Walk me through your key experience highlighted on your resume.',
    depth: 'SURFACE',
    category: 'EXPERIENCE'
  };

  // 6-Second Spin Algorithm: Cycles smoothly through all 30 questions in bank
  const spinWheel = () => {
    unlockAudio();
    if (isSpinning || activeQuestions.length === 0) return;

    setIsSpinning(true);
    setActiveQuestion(null);

    const startTime = Date.now();
    const TOTAL_DURATION_MS = 6000; // 6 seconds spin!
    let shuffleCounter = Math.floor(Math.random() * activeQuestions.length);

    let currentDelay = 70;

    const runStep = () => {
      const elapsed = Date.now() - startTime;
      shuffleCounter = (shuffleCounter + 1) % activeQuestions.length;
      setCurrentIndex(shuffleCounter);

      const progress = elapsed / TOTAL_DURATION_MS;
      const pitchMultiplier = 0.9 + progress * 0.3;
      playTickSound(pitchMultiplier);

      if (elapsed < TOTAL_DURATION_MS) {
        if (elapsed > 4000) {
          const decelerationFactor = (elapsed - 4000) / 2000;
          currentDelay = 70 + Math.pow(decelerationFactor, 2) * 450;
        } else {
          currentDelay = Math.max(50, 70 - Math.sin(progress * Math.PI) * 20);
        }

        setTimeout(runStep, currentDelay);
      } else {
        // Wheel landed after 6 seconds!
        const finalQuestion = activeQuestions[shuffleCounter];
        setActiveQuestion(finalQuestion);
        setIsSpinning(false);
        playLandChimeSound();
      }
    };

    runStep();
  };

  useEffect(() => {
    if (activeQuestions.length > 0) {
      setActiveQuestion(activeQuestions[0]);
    }
  }, [depth, selectedCategory]);

  return (
    <div className="min-h-[85vh] flex flex-col justify-between items-center px-4 py-6 max-w-4xl mx-auto space-y-8 select-none text-[#e0f2fe]">
      
      {/* Top Header / Depth Switcher */}
      <div className="w-full flex flex-col items-center space-y-6">
        
        {/* Top bar with back button */}
        <div className="w-full flex items-center justify-start">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#111622] hover:bg-[#1b2235] text-gray-300 hover:text-white text-xs font-semibold border border-blue-500/20 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>Home</span>
          </button>
        </div>

        {/* Depth Pill Switcher (Sleek Blue & Black Theme) */}
        <div className="inline-flex items-center p-1.5 rounded-full bg-[#111622] border border-blue-500/30 shadow-xl">
          <button
            onClick={() => setDepth('SURFACE')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-200 ${
              depth === 'SURFACE'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Brain className="w-4 h-4 text-cyan-300" />
            <span>Off the cuff</span>
          </button>

          <button
            onClick={() => setDepth('DEEP')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-200 ${
              depth === 'DEEP'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4 text-cyan-300" />
            <span>Deep research</span>
          </button>
        </div>

        {/* Subtitle based on mode */}
        <p className="text-xs sm:text-sm text-gray-400 font-medium text-center">
          {depth === 'SURFACE' 
            ? 'Minimal prep. Try to think quick on your feet.'
            : 'Deep technical breakdown & edge-case architecture questions from your resume.'
          }
        </p>

        {/* Category Dropdown */}
        <div className="relative inline-block text-left">
          <div className="flex items-center gap-2 bg-[#111622] border border-blue-500/30 hover:border-cyan-400/50 rounded-2xl px-4 py-2.5 text-xs text-gray-200 font-semibold cursor-pointer shadow-md">
            <Bot className="w-4 h-4 text-cyan-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ResumeCategory)}
              className="bg-transparent text-gray-200 outline-none cursor-pointer appearance-none pr-6 font-medium text-xs"
            >
              <option value="ALL" className="bg-[#111622] text-gray-200">🤖 All 30 Resume Topics ({activeQuestions.length})</option>
              <option value="PROJECTS" className="bg-[#111622] text-gray-200">💻 Projects & Codebase</option>
              <option value="SKILLS" className="bg-[#111622] text-gray-200">⚡ Tech Stack & Tools</option>
              <option value="EXPERIENCE" className="bg-[#111622] text-gray-200">💼 Work Experience & Extracurriculars</option>
              <option value="ARCHITECTURE" className="bg-[#111622] text-gray-200">🏗️ System Architecture & Trade-offs</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 pointer-events-none" />
          </div>
        </div>

        {/* Resume Info Badge */}
        <div className="flex items-center gap-2 text-[11px] text-gray-400 bg-[#111622] px-3.5 py-1.5 rounded-full border border-blue-500/20">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          <span>Grounded in: <strong className="text-cyan-300">{resumeData.name || 'Your Resume'}</strong> ({activeQuestions.length} Questions)</span>
          <button 
            onClick={onChangeResume} 
            className="text-cyan-400 underline hover:text-cyan-300 ml-1 font-semibold"
          >
            Change
          </button>
        </div>

      </div>

      {/* Center Wheel Drawer Display with 3D Depth */}
      <div className="w-full flex-1 flex flex-col items-center justify-center my-6 min-h-[280px] wheel-stage-3d">
        <div className="w-full bg-[#111622] border border-blue-500/40 rounded-[2.5rem] p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden card-3d anime-glow-blue preserve-3d">
          
          <div className="tracking-[0.25em] text-[11px] font-extrabold uppercase text-cyan-400 font-mono flex items-center justify-center gap-2 card-3d-pop">
            <span className={`w-3 h-3 rounded-full wheel-hub-3d ${isSpinning ? 'bg-cyan-400 animate-ping' : 'bg-blue-500'}`} />
            <span>{isSpinning ? 'SPINNING...' : 'TOPIC'}</span>
          </div>

          <div className={`transition-all duration-200 transform preserve-3d ${isSpinning ? 'scale-95 opacity-80 rotateX-6' : 'scale-100 opacity-100'}`}>
            <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-white font-normal leading-relaxed tracking-tight drop-shadow-lg">
              “{currentItem.text}”
            </h1>
          </div>

          {currentItem.sourceSnippet && !isSpinning && (
            <div className="pt-2 card-3d-pop">
              <span className="inline-block px-4 py-1.5 rounded-full text-[11px] font-semibold bg-blue-500/15 border border-blue-500/40 text-cyan-300 shadow-md">
                {currentItem.category === 'PROJECTS' || currentItem.category === 'ARCHITECTURE'
                  ? `In regards to your project: ${currentItem.sourceSnippet}`
                  : currentItem.category === 'EXPERIENCE'
                  ? `In regards to your work experience at: ${currentItem.sourceSnippet}`
                  : `In regards to your skill: ${currentItem.sourceSnippet}`
                }
              </span>
            </div>
          )}

        </div>
      </div>

      {/* Bottom Action Bar (3D Tactile Buttons) */}
      <div className="w-full flex flex-wrap items-center justify-center gap-4 pt-4">
        
        {/* Spin Wheel Button */}
        <button
          onClick={spinWheel}
          disabled={isSpinning}
          className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl btn-3d-primary text-white font-bold text-sm disabled:opacity-50 min-w-[140px]"
        >
          <RotateCw className={`w-4 h-4 text-white ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? 'Spinning...' : 'Spin'}</span>
        </button>

        {/* Start X min timer Button */}
        <button
          onClick={() => onStartTimer(currentItem.text, depth === 'DEEP' ? researchMinutes : speechMinutes)}
          disabled={isSpinning}
          className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl btn-3d-dark text-white font-bold text-sm disabled:opacity-50"
        >
          <Timer className="w-4 h-4 text-emerald-400" />
          <span>Start {depth === 'DEEP' ? researchMinutes : speechMinutes} min timer</span>
        </button>

        {/* Practice/Prep Button */}
        <button
          onClick={() => onSelectQuestion(currentItem.text, currentItem)}
          disabled={isSpinning}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl btn-3d-dark text-gray-200 hover:text-white font-bold text-sm disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Practice Prompt</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={() => setShowSettingsModal(true)}
          className="p-3.5 rounded-2xl btn-3d-dark text-gray-400 hover:text-white"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Modal (Blue & Black Theme) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111622] text-[#e0f2fe] rounded-[2rem] p-7 border border-blue-500/30 max-w-md w-full space-y-6 text-left shadow-2xl">
            
            {/* Modal Title & Subtitle */}
            <div className="space-y-1">
              <h2 className="font-serif text-3xl font-normal text-white">Settings</h2>
              <p className="text-xs text-gray-400 font-medium">Timer lengths in whole minutes.</p>
            </div>

            {/* SPEECH SLIDER */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold tracking-widest text-cyan-400 uppercase">SPEECH</span>
                <span className="font-serif text-2xl text-white font-normal">{speechMinutes} min</span>
              </div>
              
              <input
                type="range"
                min={1}
                max={10}
                value={speechMinutes}
                onChange={(e) => setSpeechMinutes(Number(e.target.value))}
                className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              
              <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
                <span>1 min</span>
                <span>10 min</span>
              </div>
            </div>

            {/* RESEARCH SLIDER */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold tracking-widest text-cyan-400 uppercase">RESEARCH</span>
                <span className="font-serif text-2xl text-white font-normal">{researchMinutes} min</span>
              </div>
              
              <input
                type="range"
                min={1}
                max={60}
                value={researchMinutes}
                onChange={(e) => setResearchMinutes(Number(e.target.value))}
                className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              
              <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
                <span>1 min</span>
                <span>60 min</span>
              </div>
              
              <span className="text-xs text-gray-400 block pt-0.5">Deep research only</span>
            </div>

            {/* MUTE SOUND EFFECTS CHECKBOX */}
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer text-sm text-gray-200 select-none">
                <input
                  type="checkbox"
                  checked={isMuted}
                  onChange={(e) => handleToggleMute(e.target.checked)}
                  className="w-4 h-4 rounded bg-white/10 border-white/20 accent-blue-500 cursor-pointer"
                />
                <span>Mute sound effects</span>
              </label>
            </div>

            {/* DIVIDER & FOOTER */}
            <div className="border-t border-white/10 pt-4 space-y-4">
              <p className="text-xs text-gray-400 font-medium">Saved for next time.</p>

              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
