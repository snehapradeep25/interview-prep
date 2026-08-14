import React, { useState, useEffect } from 'react';
import { CheckCircle2, Brain } from 'lucide-react';

export const ProcessingScreen: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps = [
    { title: 'Transcribing Audio', desc: 'Converting your spoken speech into accurate text...' },
    { title: 'Analyzing English', desc: 'Evaluating fluency, grammar, and vocabulary complexity...' },
    { title: 'Evaluating Structure', desc: 'Checking opening, supporting points, examples, and conclusion...' },
    { title: 'Preparing Improved Answer', desc: 'Formulating a natural, confident version of your response...' }
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 500);
    const timer2 = setTimeout(() => setCurrentStep(2), 1200);
    const timer3 = setTimeout(() => setCurrentStep(3), 1800);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-8">
      <div className="relative w-24 h-24 mx-auto">
        <div className="absolute inset-0 bg-pink-500/30 rounded-full blur-2xl animate-pulse" />
        <div className="w-full h-full rounded-3xl bg-[#131622] border border-pink-500/40 flex items-center justify-center relative z-10 shadow-2xl">
          <Brain className="w-12 h-12 text-pink-400 animate-bounce" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="font-heading font-extrabold text-3xl text-white">
          KomiAI is Analyzing Your Response
        </h2>
        <p className="text-gray-400 text-sm">
          Please wait a moment while we evaluate your speaking performance...
        </p>
      </div>

      <div className="bg-[#131622] rounded-2xl p-6 border border-white/10 space-y-4 text-left">
        {steps.map((step, idx) => (
          <div 
            key={idx}
            className={`flex items-start gap-4 p-3 rounded-xl transition-all ${
              idx === currentStep 
                ? 'bg-pink-500/10 border border-pink-500/30 text-white' 
                : idx < currentStep 
                  ? 'text-gray-300 opacity-80' 
                  : 'text-gray-500 opacity-40'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
              idx < currentStep 
                ? 'bg-emerald-500 text-white' 
                : idx === currentStep 
                  ? 'bg-pink-500 text-white animate-pulse' 
                  : 'bg-white/10 text-gray-400'
            }`}>
              {idx < currentStep ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
            </div>

            <div>
              <h4 className="font-heading font-bold text-sm">{step.title}</h4>
              <p className="text-xs text-gray-400">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
