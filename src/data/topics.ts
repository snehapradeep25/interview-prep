import type { Topic } from '../types';


export const TOPIC_DATABASE: Topic[] = [
  {
    id: '1',
    title: 'Is social media more helpful or harmful to students?',
    category: 'Education',
    difficulty: 'Medium',
    prepMinutes: 15,
    description: 'Discuss mental health, academic performance, and connectivity.'
  },
  {
    id: '2',
    title: 'Should artificial intelligence replace certain human jobs?',
    category: 'Technology',
    difficulty: 'Difficult',
    prepMinutes: 20,
    description: 'Explore automation, economic impacts, and emerging job fields.'
  },
  {
    id: '3',
    title: 'Describe a personal hobby that shaped your worldview.',
    category: 'Personal Opinion',
    difficulty: 'Easy',
    prepMinutes: 10,
    description: 'Share why you love it, how you started, and what it taught you.'
  },
  {
    id: '4',
    title: 'Should college education be completely free and online?',
    category: 'Education',
    difficulty: 'Medium',
    prepMinutes: 15,
    description: 'Evaluate accessibility, practical learning, and institutional costs.'
  },
  {
    id: '5',
    title: 'Would you rather work remotely forever or work in an office?',
    category: 'Career',
    difficulty: 'Easy',
    prepMinutes: 10,
    description: 'Compare work-life balance, collaboration, and personal freedom.'
  },
  {
    id: '6',
    title: 'How can cities reduce single-use plastic waste effectively?',
    category: 'Environment',
    difficulty: 'Medium',
    prepMinutes: 15,
    description: 'Propose policy changes, public incentives, and tech solutions.'
  },
  {
    id: '7',
    title: 'Should students be allowed to use ChatGPT for homework assignments?',
    category: 'Current Trends',
    difficulty: 'Medium',
    prepMinutes: 15,
    description: 'Debate academic integrity versus modern digital literacy.'
  },
  {
    id: '8',
    title: 'Tell a story about a failure that turned out to be a valuable lesson.',
    category: 'Storytelling',
    difficulty: 'Easy',
    prepMinutes: 10,
    description: 'Set the scene, explain the mistake, and highlight your growth.'
  },
  {
    id: '9',
    title: 'How does remote learning affect children’s social skills long-term?',
    category: 'Society',
    difficulty: 'Difficult',
    prepMinutes: 20,
    description: 'Examine communication habits, isolation, and digital adaptation.'
  },
  {
    id: '10',
    title: 'If you could launch a startup tomorrow, what problem would you solve?',
    category: 'Problem Solving',
    difficulty: 'Advanced',
    prepMinutes: 25,
    description: 'Outline the problem, target audience, and your unique solution.'
  },
  {
    id: '11',
    title: 'What is the single most important quality of a great team leader?',
    category: 'Career',
    difficulty: 'Easy',
    prepMinutes: 10,
    description: 'Choose one trait (empathy, clarity, vision) and justify it.'
  },
  {
    id: '12',
    title: 'Will cash completely disappear in favor of digital currency in 10 years?',
    category: 'Current Trends',
    difficulty: 'Difficult',
    prepMinutes: 20,
    description: 'Discuss cybersecurity, financial inclusion, and privacy concerns.'
  }
];

export function getRandomTopics(count: number = 5): Topic[] {
  const shuffled = [...TOPIC_DATABASE].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
