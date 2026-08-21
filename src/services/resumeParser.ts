import type { ResumeData, ResumeQuestionItem } from '../types';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { generateMLResumeQuestions } from './mlQuestionGenerator';

// Configure local PDF.js worker via Vite bundler URL
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
}

// Extract text from raw DOCX file buffer using mammoth
export async function extractDocxText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value || '';
  } catch (err) {
    console.error('Failed to parse DOCX:', err);
    throw new Error('Could not read DOCX file. Please upload a standard text DOCX or PDF file.');
  }
}

// Helper to extract clean text lines from raw PDF text buffer, stripping binary PDF stream syntax
function extractCleanLinesFromRawText(rawText: string): string {
  const cleanLines = rawText
    .split(/[\r\n]+/)
    .map(l => l.replace(/[^A-Za-z0-9\s.,;:\-()/]/g, ' ').trim())
    .filter(l => l.length > 15 && l.split(/\s+/).length > 2 && !isGarbageLine(l));

  return cleanLines.join('\n');
}

// PDF Extractor with Guaranteed 5-Second Max Timeout
export async function extractPdfText(file: File): Promise<string> {
  return new Promise<string>((resolve) => {
    let resolved = false;

    const fallbackTimer = setTimeout(async () => {
      if (!resolved) {
        resolved = true;
        console.warn('PDF parsing reached 5s max limit, proceeding with fast text extractor.');
        try {
          const rawText = await file.text();
          const cleanText = extractCleanLinesFromRawText(rawText);
          resolve(cleanText || `Resume: ${file.name}`);
        } catch {
          resolve(`Resume: ${file.name}`);
        }
      }
    }, 5000);

    const safeFinish = (resText: string) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(fallbackTimer);
        resolve(resText && resText.trim().length > 20 ? resText : `Resume: ${file.name}`);
      }
    };

    file.arrayBuffer().then(async (arrayBuffer) => {
      try {
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDoc = await loadingTask.promise;

        let fullText = '';
        const maxPages = Math.min(pdfDoc.numPages, 10);
        for (let i = 1; i <= maxPages; i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();
          const pageItems = textContent.items.map((item: any) => item.str || '').filter(Boolean);
          fullText += pageItems.join(' ') + '\n';
        }

        safeFinish(fullText);
      } catch (err) {
        console.warn('PDF.js processing error, using fallback parser:', err);
        try {
          const rawText = await file.text();
          safeFinish(extractCleanLinesFromRawText(rawText));
        } catch {
          safeFinish(`Resume: ${file.name}`);
        }
      }
    }).catch(async (err) => {
      console.warn('File arrayBuffer error:', err);
      try {
        const rawText = await file.text();
        safeFinish(extractCleanLinesFromRawText(rawText));
      } catch {
        safeFinish(`Resume: ${file.name}`);
      }
    });
  });
}

// Filter out binary PDF stream noise / gibberish lines
function isGarbageLine(line: string): boolean {
  if (line.length < 3) return true;
  if (/gmkw|\.\/bp|\b[a-z0-9]{8,}\b|v6io|bgbu|qvfl|stream|endstream|obj|endobj/i.test(line)) return true;
  
  const words = line.split(/\s+/);
  let invalidWordCount = 0;
  for (const w of words) {
    if (/^[a-z]+[A-Z]+[a-z]+$/i.test(w) && w.length > 10) invalidWordCount++;
    if (/[)(/\\:]{2,}/.test(w)) invalidWordCount++;
  }
  if (words.length > 0 && invalidWordCount / words.length > 0.25) return true;
  return false;
}

// List of action verbs that signify bullet points / achievements rather than project or role titles
const ACTION_VERBS = new Set([
  'built', 'designed', 'implemented', 'developed', 'created', 'engineered', 'integrated',
  'led', 'managed', 'optimized', 'reduced', 'increased', 'automated', 'scaled', 'deployed',
  'configured', 'refactored', 'maintained', 'standardized', 'orchestrated', 'spearheaded',
  'architected', 'wrote', 'crafted', 'facilitated', 'improved', 'launched', 'migrated',
  'revamped', 'supervised', 'tested', 'transformed', 'utilized', 'utilised', 'constructed',
  'headed', 'established', 'pioneered', 'streamlined', 'parsed', 'generated', 'achieved',
  'collaborated', 'trained', 'coordinated', 'delivered', 'formulated', 'monitored', 'resolved'
]);

function startsWithActionVerb(text: string): boolean {
  const firstWord = text.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '') || '';
  return ACTION_VERBS.has(firstWord);
}

// Clean title string from numbers, bullet markers, dates, or URLs
function cleanTitleString(title: string): string {
  return title
    .replace(/^[-•*#\d.]+\s*/, '')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*\|.*/, '')
    .replace(/\s*-\s*\d{4}.*/, '')
    .replace(/\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|present|\d{4}).*/i, '')
    .trim();
}

export interface ExtractedDetail {
  title: string;
  companyOrContext?: string;
  bullets: string[];
  techs: string[];
}

export function parseResumeContent(rawText: string): ResumeData {
  const rawLines = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  const lines = rawLines.filter(l => !isGarbageLine(l));
  
  // Extract Candidate Name
  let name = 'Candidate';
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (
      line.length > 2 && line.length < 40 &&
      !/@|http|www|github|linkedin|summary|skills|experience|projects|education|contact|phone/i.test(line) &&
      !startsWithActionVerb(line)
    ) {
      name = cleanTitleString(line);
      break;
    }
  }

  // Known Tech Skills
  const knownSkills = [
    'React', 'TypeScript', 'JavaScript', 'Python', 'Node.js', 'Next.js',
    'HTML', 'CSS', 'Tailwind', 'SQL', 'MongoDB', 'PostgreSQL', 'Docker',
    'AWS', 'Git', 'Java', 'C++', 'C#', '.NET', 'Express', 'Redux', 'GraphQL',
    'REST APIs', 'Jest', 'Vercel', 'Figma', 'UI/UX', 'Machine Learning', 'Agile',
    'Kubernetes', 'Linux', 'Flutter', 'Dart', 'Swift', 'Kotlin', 'Go', 'Rust',
    'Firebase', 'Supabase', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Pandas',
    'NumPy', 'Flask', 'FastAPI', 'Spring Boot', 'PHP', 'Laravel', 'Vue.js', 'Angular'
  ];

  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const extractedSkills: string[] = [];

  knownSkills.forEach(skill => {
    try {
      const escaped = escapeRegExp(skill);
      const regex = new RegExp(`(?:\\b|(?<=\\W))${escaped}(?:\\b|(?=\\W))`, 'i');
      if (regex.test(rawText) || rawText.toLowerCase().includes(skill.toLowerCase())) {
        extractedSkills.push(skill);
      }
    } catch {
      if (rawText.toLowerCase().includes(skill.toLowerCase())) {
        extractedSkills.push(skill);
      }
    }
  });

  const uniqueSkills = Array.from(new Set(extractedSkills));

  // Extract Projects & Experiences
  const projectDetails: ExtractedDetail[] = [];
  const experienceDetails: ExtractedDetail[] = [];
  const rawHighlights: string[] = [];

  let currentCategory: 'NONE' | 'PROJECTS' | 'EXPERIENCE' = 'NONE';
  let currentDetail: ExtractedDetail | null = null;

  const projectHeaderRegex = /^(?:projects|portfolio|built|developed|applications|selected projects|personal projects|academic projects|technical projects)/i;
  const experienceHeaderRegex = /^(?:experience|work experience|employment|work history|professional experience|internship|roles)/i;
  const otherSectionRegex = /^(?:extracurricular|activities|leadership|volunteer|awards|education|skills|summary|certifications)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check section headers
    if (projectHeaderRegex.test(line) && line.length < 50) {
      if (currentDetail && currentCategory === 'PROJECTS') projectDetails.push(currentDetail);
      if (currentDetail && currentCategory === 'EXPERIENCE') experienceDetails.push(currentDetail);
      currentCategory = 'PROJECTS';
      currentDetail = null;
      continue;
    } else if (experienceHeaderRegex.test(line) && line.length < 50) {
      if (currentDetail && currentCategory === 'PROJECTS') projectDetails.push(currentDetail);
      if (currentDetail && currentCategory === 'EXPERIENCE') experienceDetails.push(currentDetail);
      currentCategory = 'EXPERIENCE';
      currentDetail = null;
      continue;
    } else if (otherSectionRegex.test(line) && line.length < 50) {
      if (currentDetail && currentCategory === 'PROJECTS') projectDetails.push(currentDetail);
      if (currentDetail && currentCategory === 'EXPERIENCE') experienceDetails.push(currentDetail);
      currentCategory = 'NONE';
      currentDetail = null;
      continue;
    }

    const isBulletMarker = /^[-•*#]|\d+\.|\w+\)/.test(line);
    const cleanLine = line.replace(/^[-•*#\d.]+\s*/, '').trim();

    if (cleanLine.length < 4 || isGarbageLine(cleanLine)) continue;

    // Extract inline technologies in line e.g. "Project Name (React, Node.js)"
    const inlineTechs: string[] = [];
    const techParenMatch = line.match(/\(([^)]+)\)/);
    if (techParenMatch) {
      const parenthesized = techParenMatch[1];
      knownSkills.forEach(s => {
        if (parenthesized.toLowerCase().includes(s.toLowerCase())) {
          inlineTechs.push(s);
        }
      });
    }

    const isActionBullet = isBulletMarker || startsWithActionVerb(cleanLine) || cleanLine.length > 80;

    if (currentCategory === 'PROJECTS') {
      if (!isActionBullet && cleanLine.length < 60) {
        if (currentDetail) projectDetails.push(currentDetail);
        const titleCandidate = cleanTitleString(cleanLine);
        currentDetail = { 
          title: titleCandidate || 'Project', 
          bullets: [], 
          techs: inlineTechs 
        };
      } else {
        if (!currentDetail) {
          currentDetail = { title: 'Personal Technical Project', bullets: [], techs: inlineTechs };
        }
        currentDetail.bullets.push(cleanLine);
        if (inlineTechs.length > 0) {
          currentDetail.techs = Array.from(new Set([...currentDetail.techs, ...inlineTechs]));
        }
        rawHighlights.push(cleanLine);
      }
    } else if (currentCategory === 'EXPERIENCE') {
      if (!isActionBullet && cleanLine.length < 60) {
        if (currentDetail) experienceDetails.push(currentDetail);
        
        let role = cleanLine;
        let company = '';
        if (cleanLine.includes('—') || cleanLine.includes('-') || cleanLine.includes('|') || cleanLine.includes(' at ')) {
          const parts = cleanLine.split(/—|-|\||\bat\b/i);
          role = parts[0].trim();
          company = parts[1]?.trim() || '';
        }

        currentDetail = { 
          title: cleanTitleString(role) || 'Software Engineer', 
          companyOrContext: cleanTitleString(company), 
          bullets: [], 
          techs: inlineTechs 
        };
      } else {
        if (!currentDetail) {
          currentDetail = { title: 'Software Developer', bullets: [], techs: inlineTechs };
        }
        currentDetail.bullets.push(cleanLine);
        if (inlineTechs.length > 0) {
          currentDetail.techs = Array.from(new Set([...currentDetail.techs, ...inlineTechs]));
        }
        rawHighlights.push(cleanLine);
      }
    } else {
      if (cleanLine.length > 25 && startsWithActionVerb(cleanLine)) {
        rawHighlights.push(cleanLine);
      }
    }
  }

  if (currentDetail && currentCategory === 'PROJECTS') projectDetails.push(currentDetail);
  if (currentDetail && currentCategory === 'EXPERIENCE') experienceDetails.push(currentDetail);

  // Fallback: If no projects found under section headers, parse non-bullet lines containing project keywords
  if (projectDetails.length === 0) {
    lines.forEach((line) => {
      const clean = cleanTitleString(line);
      if (
        clean.length > 4 && clean.length < 50 && 
        !isGarbageLine(clean) && 
        !clean.includes('@') && 
        !clean.includes('http') &&
        !startsWithActionVerb(clean) &&
        /app|dashboard|system|platform|tool|service|website|api|bot|analytics|portal|hub|engine/i.test(clean)
      ) {
        projectDetails.push({ title: clean, bullets: [], techs: [] });
      }
    });
  }

  // Ensure clean titles without Action Verbs or bullet text
  const cleanProjects = projectDetails.map(p => ({
    ...p,
    title: cleanTitleString(p.title)
  })).filter(p => p.title.length > 2 && !startsWithActionVerb(p.title));

  const cleanExperience = experienceDetails.map(e => ({
    ...e,
    title: cleanTitleString(e.title)
  })).filter(e => e.title.length > 2 && !startsWithActionVerb(e.title));

  const data: ResumeData = {
    name,
    summary: rawText.slice(0, 250) + '...',
    skills: uniqueSkills,
    projects: cleanProjects.map(p => ({ 
      title: p.title, 
      tech: p.techs.join(', ') || undefined,
      description: p.bullets[0] || 'Technical project' 
    })),
    experience: cleanExperience.map(e => ({ 
      role: e.title, 
      company: e.companyOrContext || '', 
      duration: '' 
    })),
    education: ['Education listed on resume'],
    rawText
  };

  data.questionBank = generateDeepProjectQuestions(data, cleanProjects, cleanExperience, rawHighlights, uniqueSkills);
  return data;
}

/**
 * Generates up to 30 context-grounded technical questions based on the candidate's actual projects,
 * work experience, bullet achievements, and tech stack.
 */
export function generateDeepProjectQuestions(
  data: ResumeData,
  projectDetails: ExtractedDetail[],
  experienceDetails: ExtractedDetail[],
  rawHighlights: string[],
  uniqueSkills: string[]
): ResumeQuestionItem[] {
  return generateMLResumeQuestions(data, projectDetails, experienceDetails, rawHighlights, uniqueSkills);
}

export function generateResumeQuestions(data: ResumeData): string[] {
  const bank = data.questionBank || generateDeepProjectQuestions(data, [], [], [], []);
  return bank.map(q => q.text);
}

export const SAMPLE_RESUME_TEXT = `
ALEX MORGAN
Email: alex.morgan@example.com | Portfolio: alexmorgan.dev | GitHub: github.com/alexmorgan

SUMMARY
Energetic Full Stack Developer with 2+ years of experience building modern web applications using React, TypeScript, Node.js, and Tailwind CSS. Passionate about performant UX, clean architecture, and real-time APIs.

SKILLS
Frontend: React, TypeScript, Next.js, Tailwind CSS, Redux, HTML5, CSS3
Backend: Node.js, Express, Python, MongoDB, PostgreSQL, REST APIs
Tools & DevOps: Git, Docker, Vercel, AWS, Jest

PROJECTS
E-Commerce Analytics Dashboard (React, TypeScript, Recharts)
- Reduced dashboard load time by 40% using optimistic rendering and code-splitting.
- Built a real-time data visualizer tracking 10,000+ daily order transactions.

AI Study Coach & Voice Assistant (Python, Node.js, OpenAI API)
- Created a speech-to-text practice tool for students preparing for exam presentations.
- Integrated audio stream processing and structured JSON AI scoring pipelines.

EXPERIENCE
Frontend Developer Intern — CloudTech Inc. (2023 - Present)
- Collaborated with 5 engineers to implement responsive UI design systems.
- Wrote unit tests in Jest achieving 85% code coverage across core components.

EXTRACURRICULAR & LEADERSHIP
Hackathon Team Lead — Organized a 24-hour university web dev hackathon for 120+ participants.
Open Source Contributor — Contributed bug fixes to React ecosystem UI components.

EDUCATION
B.S. in Computer Science — State University (2020 - 2024)
`;

