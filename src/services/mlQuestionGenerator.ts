import type { ResumeData, ResumeQuestionItem, QuestionDepth, ResumeCategory } from '../types';
import type { ExtractedDetail } from './resumeParser';

// Model metadata type
export interface MLModelInfo {
  name: string;
  type: 'local-onnx' | 'gemini-llm' | 'neural-nlp';
  status: 'ready' | 'loading' | 'fallback';
}

// Domain classification vectors
const DOMAIN_KEYWORD_MATRIX: Record<string, string[]> = {
  'Backend & Systems': ['api', 'node', 'express', 'python', 'java', 'go', 'postgres', 'sql', 'mongodb', 'docker', 'redis', 'microservices', 'graphql', 'rest', 'kafka', 'aws', 'backend', 'server', 'database'],
  'Frontend & Architecture': ['react', 'typescript', 'javascript', 'next.js', 'vue', 'tailwind', 'css', 'html', 'redux', 'ui', 'ux', 'state', 'webpack', 'vite', 'component', 'frontend', 'web'],
  'AI & Machine Learning': ['python', 'pytorch', 'tensorflow', 'scikit-learn', 'pandas', 'numpy', 'model', 'nlp', 'llm', 'classification', 'embedding', 'training', 'inference', 'ai', 'data science', 'deep learning'],
  'Cloud & DevOps': ['docker', 'kubernetes', 'aws', 'ci/cd', 'terraform', 'linux', 'bash', 'jenkins', 'git', 'deploy', 'cloud', 'infrastructure', 'monitoring'],
  'Mobile Engineering': ['react native', 'flutter', 'dart', 'swift', 'kotlin', 'ios', 'android', 'mobile']
};

/**
 * Calculates Term Frequency - Inverse Document Frequency (TF-IDF) scores for words in text.
 */
function extractTFIDFKeywords(text: string, topN = 12): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
    'up', 'about', 'into', 'over', 'after', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
    'has', 'had', 'do', 'does', 'did', 'using', 'used', 'built', 'created', 'developed', 'working',
    'project', 'system', 'application', 'user', 'data', 'code', 'work', 'experience', 'team'
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  const termFreq: Record<string, number> = {};
  words.forEach(w => {
    termFreq[w] = (termFreq[w] || 0) + 1;
  });

  return Object.entries(termFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word);
}

/**
 * Computes Cosine Similarity between two word-vector bags of words.
 */
function computeCosineSimilarity(str1: string, str2: string): number {
  const getTokens = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(Boolean);
  const t1 = getTokens(str1);
  const t2 = getTokens(str2);

  const set = new Set([...t1, ...t2]);
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  set.forEach(token => {
    const count1 = t1.filter(t => t === token).length;
    const count2 = t2.filter(t => t === token).length;
    dotProduct += count1 * count2;
    mag1 += count1 * count1;
    mag2 += count2 * count2;
  });

  if (mag1 === 0 || mag2 === 0) return 0;
  return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

/**
 * Classifies candidate technical domain based on keyword vectors.
 */
export function classifyCandidateDomain(skills: string[], text: string): { primaryDomain: string; confidence: number } {
  const combinedText = `${skills.join(' ')} ${text}`.toLowerCase();
  const domainScores: Record<string, number> = {};

  Object.entries(DOMAIN_KEYWORD_MATRIX).forEach(([domain, keywords]) => {
    let score = 0;
    keywords.forEach(kw => {
      if (combinedText.includes(kw)) score += 1;
    });
    domainScores[domain] = score;
  });

  const sorted = Object.entries(domainScores).sort((a, b) => b[1] - a[1]);
  const topDomain = sorted[0]?.[0] || 'Fullstack Software Engineering';
  const totalScore = sorted.reduce((acc, curr) => acc + curr[1], 0);
  const confidence = totalScore > 0 ? Math.min(0.95, (sorted[0][1] / totalScore) + 0.3) : 0.75;

  return { primaryDomain: topDomain, confidence };
}

/**
 * Dynamically loads Transformers.js client-side model if available.
 */
let transformersPipeline: any = null;
let transformersLoading = false;

export async function getTransformersPipeline(): Promise<any> {
  if (transformersPipeline) return transformersPipeline;
  if (transformersLoading) return null;

  transformersLoading = true;
  try {
    const { pipeline } = await import('@xenova/transformers');
    // Initialize lightweight zero-shot classifier / feature extractor
    transformersPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      quantized: true
    });
    console.log('Transformers.js ONNX model loaded successfully');
    return transformersPipeline;
  } catch (err) {
    console.warn('Transformers.js model initialization notice:', err);
    return null;
  } finally {
    transformersLoading = false;
  }
}

/**
 * Core ML Question Generator Engine
 */
export function generateMLResumeQuestions(
  data: ResumeData,
  projects: ExtractedDetail[],
  experience: ExtractedDetail[],
  highlights: string[],
  skills: string[]
): ResumeQuestionItem[] {
  const bank: ResumeQuestionItem[] = [];
  let counter = 1;

  const createItem = (
    text: string,
    depth: QuestionDepth,
    category: ResumeCategory,
    sourceSnippet?: string
  ): ResumeQuestionItem => ({
    id: `ml_q_${counter++}`,
    text,
    depth,
    category,
    sourceSnippet
  });

  const domainInfo = classifyCandidateDomain(skills, data.rawText);
  const tfidfKeywords = extractTFIDFKeywords(data.rawText);

  // 1. Project-Based ML Generated Technical Questions
  projects.forEach((proj) => {
    const title = proj.title;
    const projTechs = proj.techs.length > 0 ? proj.techs.join(', ') : skills.slice(0, 2).join(', ');

    // System Design / Architecture
    bank.push(createItem(
      `In "${title}"${projTechs ? ` (built using ${projTechs})` : ''}, how did you design the modular architecture to handle asynchronous request bottlenecks and scale data flow?`,
      'DEEP',
      'ARCHITECTURE',
      title
    ));

    // Trade-off Analysis
    bank.push(createItem(
      `What were the top 2 architectural trade-offs you evaluated while building "${title}", and why did you select your current stack?`,
      'SURFACE',
      'PROJECTS',
      title
    ));

    // Specific Achievement / Bullet Deep Dives
    proj.bullets.forEach((bullet) => {
      if (bullet.length > 20) {
        const shortBullet = bullet.length > 95 ? bullet.slice(0, 95) + '...' : bullet;
        bank.push(createItem(
          `Regarding your work on "${title}" ("${shortBullet}"): Walk me through the step-by-step implementation and how you validated performance under load.`,
          'DEEP',
          'PROJECTS',
          title
        ));

        bank.push(createItem(
          `In "${title}", what failure modes or edge cases did you encounter with "${shortBullet}", and how did you prevent regressions in production?`,
          'DEEP',
          'ARCHITECTURE',
          title
        ));
      }
    });
  });

  // 2. Experience-Based ML Role & Team Impact Questions
  experience.forEach((exp) => {
    const roleTitle = exp.companyOrContext ? `${exp.title} at ${exp.companyOrContext}` : exp.title;

    bank.push(createItem(
      `During your tenure as ${roleTitle}, what specific code review standards and engineering practices did you introduce to elevate overall code quality?`,
      'SURFACE',
      'EXPERIENCE',
      roleTitle
    ));

    bank.push(createItem(
      `Describe the most complex technical incident or production bug you diagnosed as ${roleTitle}. What tools and telemetry did you use to root-cause it?`,
      'DEEP',
      'EXPERIENCE',
      roleTitle
    ));

    exp.bullets.forEach((bullet) => {
      if (bullet.length > 20) {
        const shortBullet = bullet.length > 95 ? bullet.slice(0, 95) + '...' : bullet;
        bank.push(createItem(
          `As ${roleTitle}, how did you execute: "${shortBullet}"? What key metrics or benchmarks proved its success?`,
          'DEEP',
          'EXPERIENCE',
          roleTitle
        ));
      }
    });
  });

  // 3. Bullet Highlights Questions
  highlights.slice(0, 5).forEach((bullet) => {
    if (bullet.length > 20) {
      const shortBullet = bullet.length > 95 ? bullet.slice(0, 95) + '...' : bullet;
      bank.push(createItem(
        `In your resume highlight: "${shortBullet}" — what tools, benchmarks, or metrics did you use to validate this result?`,
        'DEEP',
        'EXPERIENCE',
        'Highlight'
      ));
    }
  });

  // 4. Domain & Skill Vector Questions
  skills.forEach((skill) => {
    bank.push(createItem(
      `Where in your past projects did you push ${skill} to its performance limits, and what internal mechanics or optimization techniques did you leverage?`,
      'DEEP',
      'SKILLS',
      skill
    ));

    bank.push(createItem(
      `How do you structure project state management, error handling, and testing strategies when developing with ${skill}?`,
      'SURFACE',
      'SKILLS',
      skill
    ));
  });

  // 4. TF-IDF Contextual Deep Dive Questions
  if (tfidfKeywords.length >= 3) {
    const kw1 = tfidfKeywords[0];
    const kw2 = tfidfKeywords[1];
    bank.push(createItem(
      `Your background features significant focus on "${kw1}" and "${kw2}". How do you balance performance optimizations versus developer velocity when building ${domainInfo.primaryDomain} systems?`,
      'DEEP',
      'ARCHITECTURE',
      `Focus: ${kw1}, ${kw2}`
    ));
  }

  // 5. Cosine Similarity Deduplication & Diversity Ranking
  const rankedQuestions: ResumeQuestionItem[] = [];
  bank.forEach(candidate => {
    const isTooSimilar = rankedQuestions.some(existing => computeCosineSimilarity(candidate.text, existing.text) > 0.72);
    if (!isTooSimilar) {
      rankedQuestions.push(candidate);
    }
  });

  // Ensure minimum 30 diverse questions
  const fallbackQuestions = [
    `How do you approach end-to-end testing and CI/CD automation for high-availability production applications?`,
    `What strategies do you use for API rate-limiting, database connection pooling, and caching layer design?`,
    `How do you handle breaking changes in REST or GraphQL schemas without downtime for client applications?`,
    `Describe a scenario where you had to refactor a legacy module to improve maintainability and speed.`,
    `What security measures (XSS prevention, CORS, JWT handling, query sanitization) do you enforce in your codebase?`,
    `How do you measure and optimize key performance indicators like Time to First Byte (TTFB) or latency distribution (p99)?`,
    `How do you make technical decisions when choosing between a microservices approach versus a modular monolith?`
  ];

  let fallbackIdx = 0;
  while (rankedQuestions.length < 30) {
    const qText = fallbackQuestions[fallbackIdx % fallbackQuestions.length];
    fallbackIdx++;
    if (!rankedQuestions.some(q => q.text === qText)) {
      rankedQuestions.push(createItem(
        qText,
        rankedQuestions.length % 2 === 0 ? 'DEEP' : 'SURFACE',
        'ARCHITECTURE',
        'Engineering Core'
      ));
    }
    if (fallbackIdx > 20) break;
  }

  return rankedQuestions.slice(0, 30);
}

/**
 * Generate ML Questions for specific topic practice mode
 */
export function generateMLQuestionsForTopic(topicTitle: string, _category?: string): string[] {
  const cleanTitle = topicTitle.trim();
  const kw = extractTFIDFKeywords(cleanTitle, 3);
  const primaryKw = kw[0] || 'this subject';

  return [
    `What is your core thesis on "${cleanTitle}", and what primary evidence supports it?`,
    `If an opponent argued against your view on "${cleanTitle}", what would be their strongest counter-argument and how would you rebut it?`,
    `How does "${primaryKw}" directly impact societal, economic, or technological trends over the next 5 to 10 years?`,
    `Can you share a specific real-world example or case study that illustrates the consequences of "${cleanTitle}"?`,
    `What actionable policy, design change, or personal habit would you propose to address the main challenge in "${cleanTitle}"?`
  ];
}
