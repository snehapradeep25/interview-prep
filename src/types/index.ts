export type DifficultyLevel = 'Easy' | 'Medium' | 'Difficult' | 'Advanced';

export type CategoryType = 
  | 'Daily Life'
  | 'Education'
  | 'Technology'
  | 'Career'
  | 'Society'
  | 'Environment'
  | 'Personal Opinion'
  | 'Current Trends'
  | 'Storytelling'
  | 'Problem Solving';

export interface Topic {
  id: string;
  title: string;
  category: CategoryType;
  difficulty: DifficultyLevel;
  prepMinutes: number; // 10, 15, 20, 25, or 30
  description?: string;
}

export type SpeakingDuration = 1 | 2 | 3; // in minutes

export type PracticeMode = 'NO_RECORDING' | 'RECORD_ONLY' | 'AI_ANALYSIS';

export type QuestionDepth = 'SURFACE' | 'DEEP';

export type ResumeCategory = 'ALL' | 'PROJECTS' | 'SKILLS' | 'EXPERIENCE' | 'ARCHITECTURE';

export interface ResumeQuestionItem {
  id: string;
  text: string;
  depth: QuestionDepth;
  category: ResumeCategory;
  sourceSnippet?: string;
}

export type AppStep = 
  | 'HOME'
  | 'TOPIC_SHUFFLE'
  | 'RESUME_UPLOAD'
  | 'RESUME_WHEEL'
  | 'PREPARATION'
  | 'CONFIG'
  | 'SPEAKING'
  | 'PROCESSING'
  | 'FEEDBACK';

export interface GrammarCorrection {
  original: string;
  corrected: string;
  explanation: string;
}

export interface VocabularySuggestion {
  original: string;
  suggested: string;
  context: string;
}

export interface StructureAnalysis {
  opening: string;
  mainPoints: string;
  example: string;
  conclusion: string;
}

export interface AIFeedbackResponse {
  overallScore: number;
  scores: {
    fluency: number;
    grammar: number;
    vocabulary: number;
    clarity: number;
    structure: number;
    relevance: number;
  };
  strengths: string[];
  improvements: string[];
  grammarCorrections: GrammarCorrection[];
  vocabularySuggestions: VocabularySuggestion[];
  fillerWords: { word: string; count: number }[];
  structureFeedback: StructureAnalysis;
  improvedAnswer: string;
  nextTip: string;
  transcript: string;
}

export interface ResumeData {
  name?: string;
  summary?: string;
  skills: string[];
  projects: { title: string; tech?: string; description?: string }[];
  experience: { role: string; company?: string; duration?: string }[];
  education: string[];
  rawText: string;
  questionBank?: ResumeQuestionItem[];
}

export interface PracticeSessionState {
  type: 'RANDOM_TOPIC' | 'RESUME_INTERVIEW';
  topic: Topic | null;
  resumeData: ResumeData | null;
  resumeQuestion: string | null;
  selectedQuestionItem?: ResumeQuestionItem | null;
  prepDurationMinutes: number;
  speakingDurationMinutes: SpeakingDuration;
  practiceMode: PracticeMode;
  audioBlob: Blob | null;
  audioUrl: string | null;
  actualSpeakingSeconds: number;
  aiFeedback: AIFeedbackResponse | null;
}

