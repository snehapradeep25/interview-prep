import React, { useState, useEffect, useRef } from 'react';
import type { SpeakingDuration, PracticeMode } from '../types';
import { VoiceRecorder } from '../services/audioRecorder';
import { Mic, Square, AlertCircle, RefreshCw, Volume2 } from 'lucide-react';

interface SpeakingScreenProps {
  topicTitle: string;
  durationMinutes: SpeakingDuration;
  practiceMode: PracticeMode;
  onFinishSpeaking: (blob: Blob | null, url: string | null, actualSeconds: number) => void;
  onCancel: () => void;
}

export const SpeakingScreen: React.FC<SpeakingScreenProps> = ({
  topicTitle,
  durationMinutes,
  practiceMode,
  onFinishSpeaking,
  onCancel
}) => {
  const totalSeconds = durationMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState<number>(totalSeconds);
  const [volumeLevel, setVolumeLevel] = useState<number>(10);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lowSpeakingWarning, setLowSpeakingWarning] = useState<boolean>(false);

  const recorderRef = useRef<VoiceRecorder | null>(null);
  const timerIntervalRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      setPermissionDenied(false);
      setErrorMessage(null);

      if (practiceMode === 'NO_RECORDING') {
        startTimer();
        return;
      }

      try {
        const recorder = new VoiceRecorder();
        recorderRef.current = recorder;
        await recorder.startRecording((vol) => {
          if (isMounted) setVolumeLevel(vol);
        });

        if (isMounted) {
          startTimer();
        }
      } catch (err: any) {
        if (isMounted) {
          setPermissionDenied(true);
          setErrorMessage(err.message || 'Microphone access is required for this practice mode.');
        }
      }
    }

    initSession();

    return () => {
      isMounted = false;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (recorderRef.current) recorderRef.current.cancel();
    };
  }, [practiceMode]);

  const startTimer = () => {
    timerIntervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          handleStop();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStop = async () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    const elapsedSeconds = totalSeconds - secondsLeft;

    // Check if user stopped too quickly (< 4 seconds)
    if (elapsedSeconds < 4 && practiceMode !== 'NO_RECORDING') {
      setLowSpeakingWarning(true);
      return;
    }

    if (practiceMode === 'NO_RECORDING' || !recorderRef.current) {
      onFinishSpeaking(null, null, Math.max(1, elapsedSeconds));
      return;
    }

    try {
      const { blob, url } = await recorderRef.current.stopRecording();
      onFinishSpeaking(blob, url, Math.max(1, elapsedSeconds));
    } catch (e) {
      onFinishSpeaking(null, null, Math.max(1, elapsedSeconds));
    }
  };

  const forceFinishAnyway = async () => {
    setLowSpeakingWarning(false);
    const elapsedSeconds = totalSeconds - secondsLeft;
    if (practiceMode === 'NO_RECORDING' || !recorderRef.current) {
      onFinishSpeaking(null, null, Math.max(1, elapsedSeconds));
      return;
    }

    try {
      const { blob, url } = await recorderRef.current.stopRecording();
      onFinishSpeaking(blob, url, Math.max(1, elapsedSeconds));
    } catch (e) {
      onFinishSpeaking(null, null, Math.max(1, elapsedSeconds));
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (permissionDenied) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-6 text-[#e0f2fe]">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="font-heading font-extrabold text-2xl text-white">Microphone Access Required</h3>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
            {errorMessage || 'Microphone access is required for this practice mode. Please allow microphone access in your browser settings and try again.'}
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl bg-white/5 text-gray-300 text-xs font-bold border border-white/10"
          >
            Go Back
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-500/25"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Access</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-10 text-center select-none text-[#e0f2fe]">
      <div className="bg-[#111622] rounded-2xl p-6 border border-blue-500/30 space-y-2 shadow-xl">
        <span className="text-[11px] font-mono-header text-cyan-400 font-bold uppercase tracking-wider">
          Currently Speaking On:
        </span>
        <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-white">
          “{topicTitle}”
        </h3>
      </div>

      <div className="relative bg-[#0b0e17] rounded-3xl p-8 sm:p-12 border border-blue-500/40 anime-glow-blue space-y-8 overflow-hidden">
        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-cyan-300 text-xs font-bold">
          {practiceMode !== 'NO_RECORDING' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
              <span>Recording Live</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Timer Mode (No Mic)</span>
            </>
          )}
        </div>

        <div className="space-y-2">
          <div className="font-mono-header text-7xl sm:text-8xl font-black tracking-widest text-white">
            {formatTime(secondsLeft)}
          </div>
          <span className="text-xs text-gray-400 uppercase tracking-widest font-mono">
            {practiceMode !== 'NO_RECORDING' ? 'Speak clearly into your microphone' : 'Speak out loud until timer expires'}
          </span>
        </div>

        {practiceMode !== 'NO_RECORDING' && (
          <div className="flex items-center justify-center gap-1.5 h-16 px-4">
            {Array.from({ length: 24 }).map((_, i) => {
              const heightMultiplier = Math.sin(i * 0.4 + Date.now() * 0.005) * 0.5 + 0.5;
              const barHeight = Math.max(12, Math.min(60, (volumeLevel * 0.7 + 10) * heightMultiplier));
              return (
                <div
                  key={i}
                  style={{ height: `${barHeight}px` }}
                  className="w-1.5 rounded-full bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-75"
                />
              );
            })}
          </div>
        )}

        <div className="pt-4 flex justify-center">
          <button
            onClick={handleStop}
            className="flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-base shadow-xl shadow-rose-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <Square className="w-5 h-5 fill-current" />
            <span>Finish & Complete Challenge</span>
          </button>
        </div>
      </div>

      {/* Warning modal if user stops in < 4 seconds */}
      {lowSpeakingWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-left">
          <div className="bg-[#111622] rounded-3xl p-6 border border-blue-500/30 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400 font-bold text-lg">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <span>Too Short for AI Analysis</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              You stopped speaking after only a few seconds. For accurate AI evaluation of fluency, grammar, and vocabulary, please speak for at least 5 to 10 seconds.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setLowSpeakingWarning(false)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md"
              >
                Continue Speaking
              </button>
              <button
                onClick={forceFinishAnyway}
                className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-semibold text-xs border border-white/10"
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
