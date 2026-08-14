# KomiAI — Resume Wheel Interview Practice Platform

**Speak better. Answer smarter. Get interview-ready.**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## Overview

**KomiAI** is a modern web application built for software engineers to practice technical interview questions grounded in their actual resume. By uploading a PDF or DOCX file, the application extracts candidate projects, work experience, tech stack, and achievements to generate tailored interview prompts via an interactive 6-second spin wheel.

---

## Features

- **Interactive 6-Second Resume Spin Wheel**: Draw randomized surface-level (*Off the cuff*) and deep technical research (*Deep research*) questions.
- **In-Memory Resume Parser**: Safely parses PDF and DOCX files directly in browser memory using PDF.js and Mammoth. Zero server data storage.
- **Grounded Question Badging**: Explicitly references exact candidate projects (`In regards to your project: ...`) and work experience (`In regards to your work experience at: ...`).
- **Synthesized Web Audio Feedback**: Low-pitch tactile wooden ratchet clicks and warm harmonic landing chimes generated dynamically via Web Audio API.
- **Flexible Timers & Settings**: Configurable speech (1–10 min) and deep research (1–60 min) timers with sound effect mute options.
- **Multi-Level Practice Modes**:
  - **Level 1 (No Recording)**: Practice speaking out loud with live visual timers (100% private).
  - **Level 2 (Record & Self-Review)**: Record audio blob to evaluate tone, speed, and clarity.
  - **Level 3 (AI Analysis)**: Detailed feedback on fluency, grammar, filler word density, and model answers.
- **High-Contrast Theme**: Clean, accessible Blue & Black dark UI built with Tailwind CSS v4.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React
- **Build Tool**: Vite 8
- **Audio Synthesis**: Web Audio API & MediaRecorder API
- **Document Parsers**: `pdfjs-dist` (PDF.js) & `mammoth` (DOCX)

---

## Quick Start

### Prerequisites
- Node.js (v18+)
- npm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/snehapradeep25/interview-prep.git

# 2. Navigate to project directory
cd interview-prep

# 3. Install dependencies
npm install

# 4. Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

```text
interview-prep/
├── public/                # Static assets & favicon
├── src/
│   ├── components/        # React UI components
│   │   ├── Header.tsx             # Navigation header bar
│   │   ├── HeroHome.tsx           # Home landing view
│   │   ├── ResumeWheelDrawer.tsx  # 6-second wheel drawer & settings
│   │   ├── ResumeUploadModal.tsx  # Drag-and-drop resume upload
│   │   ├── SpeakingConfig.tsx     # Session duration & mode selector
│   │   ├── SpeakingScreen.tsx     # Live mic recorder & waveform visualizer
│   │   └── FeedbackScreen.tsx     # AI performance feedback report
│   ├── services/          # Parser & audio logic
│   │   ├── resumeParser.ts        # PDF.js & Mammoth resume extractor
│   │   ├── soundEffects.ts        # Web Audio synthesizer
│   │   ├── audioRecorder.ts       # MediaRecorder handler
│   │   └── aiService.ts           # Speech analysis engine
│   ├── types/             # TypeScript definitions
│   ├── App.tsx            # Root application router & state
│   ├── main.tsx           # DOM entry point
│   └── index.css          # Design system & Tailwind utility styles
├── package.json
├── vite.config.ts
└── README.md
```

---

## Contributing

Contributions, bug reports, and feature requests are welcome.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for details.
