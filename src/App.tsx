import { useState } from 'react';
import type { 
  AppStep, 
  ResumeData, 
  PracticeSessionState,
  SpeakingDuration
} from './types';
import { Header } from './components/Header';
import { HeroHome } from './components/HeroHome';
import { ResumeUploadModal } from './components/ResumeUploadModal';
import { ResumeWheelDrawer } from './components/ResumeWheelDrawer';
import { PreparationScreen } from './components/PreparationScreen';
import { SpeakingConfig } from './components/SpeakingConfig';
import { SpeakingScreen } from './components/SpeakingScreen';
import { ProcessingScreen } from './components/ProcessingScreen';
import { FeedbackScreen } from './components/FeedbackScreen';
import { analyzeSpeakingSession } from './services/aiService';

export function App() {
  const [step, setStep] = useState<AppStep>('HOME');

  const [session, setSession] = useState<PracticeSessionState>({
    type: 'RESUME_INTERVIEW',
    topic: null,
    resumeData: null,
    resumeQuestion: null,
    prepDurationMinutes: 15,
    speakingDurationMinutes: 1,
    practiceMode: 'AI_ANALYSIS',
    audioBlob: null,
    audioUrl: null,
    actualSpeakingSeconds: 60,
    aiFeedback: null
  });

  const goHome = () => {
    setStep('HOME');
  };

  const handleStartResumeInterview = () => {
    setSession(prev => ({ ...prev, type: 'RESUME_INTERVIEW' }));
    if (session.resumeData) {
      setStep('RESUME_WHEEL');
    } else {
      setStep('RESUME_UPLOAD');
    }
  };

  const handleGoToWheel = (data: ResumeData) => {
    setSession(prev => ({
      ...prev,
      type: 'RESUME_INTERVIEW',
      resumeData: data
    }));
    setStep('RESUME_WHEEL');
  };

  const handleSelectResumeQuestion = (question: string, resumeData: ResumeData) => {
    setSession(prev => ({
      ...prev,
      resumeQuestion: question,
      resumeData,
      prepDurationMinutes: 15
    }));
    setStep('PREPARATION');
  };

  const handleWheelQuestionSelect = (questionText: string) => {
    setSession(prev => ({
      ...prev,
      type: 'RESUME_INTERVIEW',
      resumeQuestion: questionText,
      prepDurationMinutes: 15
    }));
    setStep('PREPARATION');
  };

  const handleWheelStartTimer = (questionText: string, durationMinutes: number) => {
    const validDuration: SpeakingDuration = (durationMinutes === 2 ? 2 : durationMinutes === 3 ? 3 : 1) as SpeakingDuration;
    setSession(prev => ({
      ...prev,
      type: 'RESUME_INTERVIEW',
      resumeQuestion: questionText,
      speakingDurationMinutes: validDuration
    }));
    setStep('SPEAKING');
  };

  const handleFinishPreparation = () => {
    setStep('CONFIG');
  };

  const handleStartSpeaking = () => {
    setStep('SPEAKING');
  };

  const handleFinishSpeaking = async (blob: Blob | null, url: string | null, actualSeconds: number) => {
    setSession(prev => ({
      ...prev,
      audioBlob: blob,
      audioUrl: url,
      actualSpeakingSeconds: actualSeconds
    }));

    if (session.practiceMode === 'AI_ANALYSIS') {
      setStep('PROCESSING');
      const targetTitle = session.resumeQuestion || 'Resume Question';

      try {
        const feedback = await analyzeSpeakingSession(
          targetTitle,
          actualSeconds,
          'RESUME_INTERVIEW'
        );
        setSession(prev => ({ ...prev, aiFeedback: feedback }));
        setStep('FEEDBACK');
      } catch (e) {
        setStep('FEEDBACK');
      }
    } else {
      setStep('FEEDBACK');
    }
  };

  const currentTopicTitle = session.resumeQuestion || 'Resume Interview Question';

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#e0e2ec] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col justify-between">
      <div>
        <Header onGoHome={goHome} currentStep={step} />

        <main className="pb-16">
          {step === 'HOME' && (
            <HeroHome
              onStartResumeInterview={handleStartResumeInterview}
            />
          )}

          {step === 'RESUME_UPLOAD' && (
            <ResumeUploadModal
              onSelectQuestion={handleSelectResumeQuestion}
              onGoToWheel={handleGoToWheel}
              onCancel={goHome}
            />
          )}

          {step === 'RESUME_WHEEL' && session.resumeData && (
            <ResumeWheelDrawer
              resumeData={session.resumeData}
              onSelectQuestion={handleWheelQuestionSelect}
              onStartTimer={handleWheelStartTimer}
              onChangeResume={() => setStep('RESUME_UPLOAD')}
              onCancel={goHome}
            />
          )}

          {step === 'PREPARATION' && (
            <PreparationScreen
              topicTitle={currentTopicTitle}
              topicCategory="Resume Question"
              prepMinutes={session.prepDurationMinutes}
              onFinishPreparation={handleFinishPreparation}
              onCancel={goHome}
            />
          )}

          {step === 'CONFIG' && (
            <SpeakingConfig
              topicTitle={currentTopicTitle}
              selectedDuration={session.speakingDurationMinutes}
              selectedMode={session.practiceMode}
              onSelectDuration={d => setSession(p => ({ ...p, speakingDurationMinutes: d }))}
              onSelectMode={m => setSession(p => ({ ...p, practiceMode: m }))}
              onStartSpeaking={handleStartSpeaking}
              onCancel={goHome}
            />
          )}

          {step === 'SPEAKING' && (
            <SpeakingScreen
              topicTitle={currentTopicTitle}
              durationMinutes={session.speakingDurationMinutes}
              practiceMode={session.practiceMode}
              onFinishSpeaking={handleFinishSpeaking}
              onCancel={goHome}
            />
          )}

          {step === 'PROCESSING' && (
            <ProcessingScreen />
          )}

          {step === 'FEEDBACK' && (
            <FeedbackScreen
              topicTitle={currentTopicTitle}
              actualSpeakingSeconds={session.actualSpeakingSeconds}
              practiceMode={session.practiceMode}
              audioUrl={session.audioUrl}
              feedback={session.aiFeedback}
              onTryResume={handleStartResumeInterview}
            />
          )}

        </main>
      </div>

      <footer className="border-t border-white/5 bg-[#08090d] py-6 px-4 text-center text-xs text-gray-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-purple-400">KomiAI</span>
            <span className="text-gray-600">•</span>
            <span>Master resume questions, build confidence, and land your dream role.</span>
          </div>

          <p className="text-[11px] text-gray-600">
            100% In-Memory Session Privacy • Zero Auth Required
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
