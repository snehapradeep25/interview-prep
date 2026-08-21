import React, { useState } from 'react';
import type { ResumeData } from '../types';
import { 
  extractDocxText, 
  extractPdfText, 
  parseResumeContent, 
  generateResumeQuestions, 
  SAMPLE_RESUME_TEXT 
} from '../services/resumeParser';
import { Upload, FileText, CheckCircle2, Sparkles, AlertCircle, ArrowRight, Dices } from 'lucide-react';

interface ResumeUploadModalProps {
  onSelectQuestion: (question: string, resumeData: ResumeData) => void;
  onGoToWheel?: (resumeData: ResumeData) => void;
  onCancel: () => void;
}

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  onSelectQuestion,
  onGoToWheel,
  onCancel
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [customText, setCustomText] = useState<string>('');
  const [showPasteTab, setShowPasteTab] = useState<boolean>(false);

  const processText = (text: string) => {
    try {
      const data = parseResumeContent(text);
      const generatedQs = generateResumeQuestions(data);
      setResumeData(data);
      setQuestions(generatedQs);
      setSelectedQuestionIndex(0);
      setError(null);

      // Auto redirect to wheel if callback provided
      if (onGoToWheel) {
        onGoToWheel(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to parse resume content.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const ext = file.name.split('.').pop()?.toLowerCase();
    try {
      let text = '';
      if (ext === 'docx') {
        text = await extractDocxText(file);
      } else if (ext === 'pdf') {
        text = await extractPdfText(file);
      } else {
        text = await file.text();
      }
      processText(text);
    } catch (err: any) {
      setError(err.message || 'Failed to extract text from resume file.');
      setLoading(false);
    }
  };

  const handleUseSampleResume = () => {
    setLoading(true);
    setTimeout(() => {
      processText(SAMPLE_RESUME_TEXT);
    }, 400);
  };

  const handleCustomPasteSubmit = () => {
    if (!customText.trim()) {
      setError('Please paste your resume text first.');
      return;
    }
    setLoading(true);
    processText(customText);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 select-none text-[#e0f2fe]">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-cyan-300 text-xs font-semibold">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>Spin</span>
        </div>
        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
          Master Interview Questions
        </h2>
      </div>

      {!resumeData ? (
        <div className="bg-[#111622] rounded-3xl p-6 sm:p-10 border border-blue-500/30 space-y-6 shadow-2xl card-3d">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowPasteTab(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${!showPasteTab ? 'btn-3d-primary text-white shadow' : 'text-gray-400 hover:text-white'}`}
              >
                File Upload (PDF / DOCX)
              </button>
              <button 
                onClick={() => setShowPasteTab(true)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${showPasteTab ? 'btn-3d-primary text-white shadow' : 'text-gray-400 hover:text-white'}`}
              >
                Paste Resume Text
              </button>
            </div>

            <button
              onClick={handleUseSampleResume}
              className="text-xs text-cyan-300 hover:text-cyan-200 underline font-medium flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Use Sample Resume</span>
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!showPasteTab ? (
            <label className="group relative border-2 border-dashed border-blue-500/30 hover:border-cyan-400/60 rounded-2xl p-8 sm:p-12 text-center cursor-pointer block bg-white/[0.02] hover:bg-blue-500/5 transition-all">
              <input 
                type="file" 
                accept=".pdf,.docx,.txt" 
                onChange={handleFileUpload} 
                className="hidden" 
                disabled={loading}
              />
              <div className="space-y-4 preserve-3d">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg shadow-cyan-500/20">
                  <Upload className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <p className="font-heading font-bold text-lg text-white">
                    {loading ? 'Running ML Model & Analyzing Resume...' : 'Drop your resume file here or click to browse'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Supports PDF, DOCX, or TXT • Automated ML Question Synthesis
                  </p>
                </div>
              </div>
            </label>
          ) : (
            <div className="space-y-4">
              <textarea
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                placeholder="Paste your resume summary, skills, and projects here..."
                rows={8}
                className="w-full bg-[#07090e] rounded-2xl p-4 text-xs sm:text-sm text-gray-200 border border-blue-500/20 focus:border-cyan-400 outline-none resize-none font-mono shadow-inner"
              />
              <button
                onClick={handleCustomPasteSubmit}
                disabled={loading || !customText.trim()}
                className="w-full py-3.5 rounded-xl btn-3d-primary text-white font-bold text-sm shadow-lg disabled:opacity-50"
              >
                {loading ? 'Processing Text...' : 'Generate Questions & Launch'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-[#111622] rounded-2xl p-6 border border-blue-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Parsed Candidate Profile</span>
                <h4 className="font-heading font-bold text-xl text-white">{resumeData.name}</h4>
              </div>
              <button 
                onClick={() => setResumeData(null)} 
                className="text-xs text-gray-400 hover:text-white underline"
              >
                Change Resume
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-gray-400 block font-medium mb-1">Key Skills Detected:</span>
                <div className="flex flex-wrap gap-1.5">
                  {resumeData.skills.map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-blue-500/20 text-cyan-300 font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-gray-400 block font-medium mb-1">Extracted Projects:</span>
                <ul className="list-disc list-inside text-gray-300 space-y-0.5">
                  {resumeData.projects.map((p, i) => (
                    <li key={i} className="truncate">{p.title}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {onGoToWheel && (
            <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/40 p-5 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <h4 className="text-white font-bold text-base flex items-center gap-2">
                  <Dices className="w-5 h-5 text-cyan-400" />
                  <span>Launch Interactive Question Wheel</span>
                </h4>
                <p className="text-xs text-gray-300 mt-1">
                  Spin the wheel with real-time sound effects to get surface or deep questions from your resume.
                </p>
              </div>
              <button
                onClick={() => onGoToWheel(resumeData)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 transition-all shrink-0"
              >
                Launch Wheel
              </button>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-heading font-bold text-lg text-white">
              Or Select an Interview Question Manually:
            </h3>

            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedQuestionIndex(idx)}
                  className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                    selectedQuestionIndex === idx
                      ? 'bg-blue-600/20 border-cyan-400 anime-glow-cyan'
                      : 'bg-[#111622] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    selectedQuestionIndex === idx ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-400'
                  }`}>
                    {selectedQuestionIndex === idx ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm sm:text-base text-white">{q}</p>
                    <span className="text-[11px] text-cyan-300/70 mt-1 block">
                      Grounded strictly in your uploaded resume
                    </span>
                  </div>
                </div>
              ))}
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
              onClick={() => onSelectQuestion(questions[selectedQuestionIndex], resumeData)}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
            >
              <span>Practice This Question</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
