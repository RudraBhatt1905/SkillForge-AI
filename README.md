# SkillForge AI 🚀

**SkillForge AI** is an advanced AI-powered career acceleration and technical interview preparation platform designed to help developers, engineers, and tech professionals master technical interviews, evaluate their readiness, and fast-track their career growth.

---

## 🌟 Key Features

### 1. 🎙️ AI Recruiter Mock Interviews
- **Live Camera & Audio Feed**: Interactive split-screen interview room with live webcam video and audio integration.
- **Voice & Speech Recognition**: Hands-free voice answering powered by the Web Speech API with real-time transcription and recruiter speech synthesis.
- **Dynamic AI Follow-Ups**: Intelligent follow-up questioning based on your actual answers across Software Engineering, System Design, Frontend, Backend, DevOps, and Data Science.
- **Comprehensive Rubric Evaluation**: Instant granular feedback scoring your technical accuracy, communication clarity, problem-solving structure, and key improvement tips.

### 2. 🧠 AI Career Mentor & Advisor
- 24/7 AI-powered conversational mentor for personalized career guidance, resume review, skill gap analysis, portfolio suggestions, and salary negotiation tactics.
- Context-aware recommendations tailored to your experience level and target roles.

### 3. ⚡ Interactive Skill Flashcards & Quizzes
- Topic-focused flashcard decks with smart AI-assisted explanations.
- Timed assessments and active-recall practice across modern frameworks, algorithms, cloud systems, and databases.

### 4. 📈 Interview Readiness Analytics & Scorecards
- Track your readiness score, strengths, and areas for improvement over time.
- Detailed interview history reports with recruiter feedback highlights and recommended study resources.

### 5. 🔐 Cloud Sync & Persistence
- User authentication and cloud data persistence powered by Firebase (Firestore & Auth).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4
- **Icons**: Lucide React
- **AI Integration**: Google Gemini API (`@google/genai`) with automatic model fallback and demand backoff
- **Speech & Media**: Web Speech API (`webkitSpeechRecognition` & `speechSynthesis`), MediaDevices WebRTC stream
- **Backend & Database**: Firebase Authentication, Cloud Firestore

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0 or higher recommended)
- npm or bun

### 1. Clone the Repository
```bash
git clone https://github.com/RudraBhatt1905/SkillForge-AI-.git
cd SkillForge-AI-
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Populate the values with your credentials:
```env
# Gemini API Key (Required for AI mentor & interview generation)
GEMINI_API_KEY="your_gemini_api_key_here"

# Application URL
APP_URL="http://localhost:3000"

# Firebase Configuration (Optional if running in local sandbox)
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECT_ID=""
VITE_FIREBASE_STORAGE_BUCKET=""
VITE_FIREBASE_MESSAGING_SENDER_ID=""
VITE_FIREBASE_APP_ID=""
```

> **Security Note**: Never commit your `.env` file or raw API keys to GitHub. The `.gitignore` file is preconfigured to exclude environment secrets and build artifacts.

### 4. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 5. Build for Production
```bash
npm run build
```

---

## 🔒 Privacy & Permissions
- **Camera & Microphone**: Camera and microphone permissions are requested solely for simulating a real-world video interview experience within your local browser session.
- **API Security**: Server-side proxy endpoints prevent client-side exposure of private API secrets.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
