import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Trophy,
  Flame,
  Target,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Compass,
  GraduationCap,
  FolderGit2,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Zap,
  Upload,
  FileText,
  FileCode,
  Check,
  RefreshCw,
} from 'lucide-react';

const SAMPLE_RESUME_TEXT = `Alex Johnson
Email: alex.johnson@example.com | Phone: +1 555-0199 | GitHub: github.com/alexj-dev | LinkedIn: linkedin.com/in/alexj-dev

EDUCATION
University Institute of Technology — B.Tech in Computer Science & Engineering
Graduation: May 2026 | CGPA: 8.7/10

TECHNICAL SKILLS
• Programming Languages: JavaScript, TypeScript, Python, C++, HTML5, CSS3, SQL
• Frameworks & Libraries: React.js, Node.js, Express.js, Tailwind CSS, Bootstrap
• Databases: PostgreSQL, MongoDB, Redis
• Tools & Cloud: Git, GitHub, Docker, Postman, VS Code, Vercel

PROJECTS
• Real-time Task Orchestrator | React, Node.js, Socket.io, PostgreSQL
  - Designed full-stack collaborative kanban application supporting concurrent multi-user editing.
  - Implemented JWT authentication and role-based access control (RBAC).
  - Reduced server response times by 35% through Redis query caching.

• Student Career Portfolio Platform | TypeScript, React, Tailwind CSS
  - Built responsive portfolio showcase with dynamic filtering and dark mode support.
  - Integrated REST APIs with automated client-side error boundaries.

EXPERIENCE & LEADERSHIP
• Web Development Lead — Campus Coding Club (2024 – Present)
  - Mentored 40+ junior developers in web fundamentals and Git version control.`;

const CAREER_GOALS = [
  'Full Stack Developer',
  'Software Developer',
  'AI/ML Engineer',
  'Data Analyst',
  'Cloud Engineer',
  'Cybersecurity Engineer',
  'DevOps Engineer',
  'UI/UX Designer',
];

export const Dashboard: React.FC = () => {
  const {
    profile,
    readinessScore,
    skillGap,
    roadmap,
    projects,
    setActiveTab,
    updateTaskStatus,
    handleResumeUpload,
    updateProfile,
    isAnalyzing,
  } = useApp();

  const [pastedText, setPastedText] = useState('');
  const [selectedGoal, setSelectedGoal] = useState(profile.careerGoal || 'Full Stack Developer');
  const [showUploader, setShowUploader] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const hasResume = Boolean(profile.resume) || profile.currentSkills.length > 0;

  // Active tasks from roadmap
  const activeTasks = roadmap
    .flatMap(phase => phase.tasks)
    .filter(t => t.status === 'in_progress' || t.status === 'not_started')
    .slice(0, 3);

  const completedTaskCount = roadmap
    .flatMap(phase => phase.tasks)
    .filter(t => t.status === 'completed').length;

  const totalTaskCount = roadmap.flatMap(phase => phase.tasks).length;
  const roadmapCompletionPercentage = Math.round(
    totalTaskCount > 0 ? (completedTaskCount / totalTaskCount) * 100 : 0
  );

  const handleUploadFromText = async (text: string, fileName = 'resume.txt') => {
    if (!text.trim()) return;
    if (selectedGoal !== profile.careerGoal) {
      await updateProfile({ careerGoal: selectedGoal });
    }
    await handleResumeUpload(fileName, text);
    setShowUploader(false);
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const text = await file.text();
      await handleUploadFromText(text, file.name);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const text = await file.text();
      await handleUploadFromText(text, file.name);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Resume Upload Box when no resume is uploaded OR user clicked to re-upload */}
      {(!hasResume || showUploader) && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-indigo-200 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" /> AI Resume Engine
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900">
                {hasResume ? 'Update Your Resume' : 'Upload Your Resume to Build Your Career Portal'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                SkillForge AI extracts your skills, education, and projects to generate a personalized skill gap analysis, learning roadmap, and career readiness score.
              </p>
            </div>

            {hasResume && (
              <button
                onClick={() => setShowUploader(false)}
                className="self-start px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Close Uploader
              </button>
            )}
          </div>

          {/* Goal Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              1. Select Target Career Role
            </label>
            <div className="flex flex-wrap gap-2">
              {CAREER_GOALS.map(goal => (
                <button
                  key={goal}
                  onClick={() => setSelectedGoal(goal)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedGoal === goal
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {selectedGoal === goal && <Check className="w-3.5 h-3.5 inline mr-1" />}
                  {goal}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Drag and Drop or Browse */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              2. Upload Resume File or Paste Text
            </label>

            <div
              onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
              onDragOver={e => { e.preventDefault(); setDragActive(true); }}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                dragActive ? 'border-indigo-600 bg-indigo-50/60' : 'border-slate-300 bg-slate-50'
              }`}
            >
              <Upload className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">
                Drag & drop your resume (.pdf text, .docx, .txt, .md)
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 mb-3">or browse from your device</p>

              <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-xs inline-flex items-center gap-1.5">
                <FileCode className="w-4 h-4" /> Browse Resume File
                <input type="file" accept=".txt,.pdf,.doc,.docx,.md" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          </div>

          {/* 3. Textarea paste */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Or Paste Resume Text
            </label>
            <textarea
              rows={4}
              value={pastedText}
              onChange={e => setPastedText(e.target.value)}
              placeholder="Paste your resume content, skills, projects, and education here..."
              className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none font-mono"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                disabled={!pastedText.trim() || isAnalyzing}
                onClick={() => handleUploadFromText(pastedText, 'pasted_resume.txt')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center gap-1.5"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" /> Analyzing Resume...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-200" /> Analyze Resume & Build Portal
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleUploadFromText(SAMPLE_RESUME_TEXT, 'Sample_Candidate_Resume.txt')}
                className="text-xs font-bold text-slate-600 hover:text-indigo-600 underline underline-offset-2"
              >
                Or test with sample student resume →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner: Career Goal & Readiness Score */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-lg">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full border border-indigo-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI Career Portal
              </span>
              {profile.resume?.fileName && (
                <span className="bg-white/10 text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" /> {profile.resume.fileName}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Target Career: <span className="text-indigo-400">{profile.careerGoal || 'Full Stack Developer'}</span>
            </h1>

            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              {readinessScore.scoreExplanation ||
                `You are ${readinessScore.overallScore}% ready for ${profile.careerGoal} opportunities based on your uploaded resume.`}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveTab('gap')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-900/50 flex items-center gap-1.5"
              >
                <Compass className="w-4 h-4" /> View Skill Gap ({skillGap.overallMatchPercentage}% Match)
              </button>
              <button
                onClick={() => setActiveTab('roadmap')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 font-bold text-xs rounded-xl transition-colors text-white border border-white/10 flex items-center gap-1.5"
              >
                Continue Roadmap ({roadmapCompletionPercentage}%)
              </button>
              <button
                onClick={() => setShowUploader(!showUploader)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 font-bold text-xs rounded-xl transition-colors text-slate-300 border border-slate-700 flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-400" /> {hasResume ? 'Re-Upload Resume' : 'Upload Resume'}
              </button>
            </div>
          </div>

          {/* Readiness Score Radial Gauge */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center relative backdrop-blur-xs">
            <div className="relative w-32 h-32 flex items-center justify-center my-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/10"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-400 transition-all duration-1000 ease-out"
                  strokeDasharray={`${readinessScore.overallScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{readinessScore.overallScore}%</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Readiness</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-indigo-200 mt-1">
              Match Grade: {readinessScore.overallScore >= 75 ? 'Industry Ready' : readinessScore.overallScore >= 50 ? 'Strong Potential' : 'Developing'}
            </p>
          </div>
        </div>

        <div className="absolute -left-12 -top-12 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
            <Flame className="w-5 h-5 fill-orange-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Active Streak</p>
            <p className="text-lg font-black text-slate-900">{profile.streakDays} Days</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Student Level</p>
            <p className="text-lg font-black text-slate-900">{profile.levelTitle?.split(':')[1] || `Lvl ${profile.level}`}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Resume Role Match</p>
            <p className="text-lg font-black text-slate-900">{skillGap.overallMatchPercentage}%</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Missing Skills</p>
            <p className="text-lg font-black text-slate-900">{skillGap.missingSkills.length} Items</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Priority Gaps & Next Up Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Key Action Items & Active Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Priority Skill Gap Summary */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-indigo-600" />
                  Top Skill Gaps for {profile.careerGoal}
                </h3>
                <p className="text-xs text-slate-500">
                  Targeted skills required to bridge your resume gap for <span className="font-semibold text-slate-800">{profile.careerGoal}</span>
                </p>
              </div>
              <button
                onClick={() => setActiveTab('gap')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                View Matrix <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {skillGap.prioritySkills.length > 0 ? (
              <div className="space-y-3">
                {skillGap.prioritySkills.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">{item.skill}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            item.gapSeverity === 'High'
                              ? 'bg-rose-100 text-rose-700'
                              : item.gapSeverity === 'Medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {item.gapSeverity} Gap
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1">{item.reason}</p>
                    </div>

                    <button
                      onClick={() => setActiveTab('roadmap')}
                      className="self-start sm:self-center px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 font-bold text-xs rounded-lg transition-colors shrink-0"
                    >
                      Start Learning
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200/60">
                <p className="text-xs text-slate-600 font-medium">
                  Upload your resume to discover your priority skill gaps for {profile.careerGoal}.
                </p>
                <button
                  onClick={() => setShowUploader(true)}
                  className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Upload Resume
                </button>
              </div>
            )}
          </div>

          {/* Active Roadmap Tasks */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  Next Learning Roadmap Tasks
                </h3>
                <p className="text-xs text-slate-500">
                  Step-by-step assignments tailored to your resume gaps
                </p>
              </div>
              <button
                onClick={() => setActiveTab('roadmap')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Roadmap <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {activeTasks.length > 0 ? (
              <div className="space-y-3">
                {activeTasks.map(task => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition-all shadow-2xs flex items-start gap-3"
                  >
                    <button
                      onClick={() => updateTaskStatus(task.id, 'completed')}
                      title="Mark task completed"
                      className="mt-0.5 text-slate-300 hover:text-emerald-600 transition-colors shrink-0"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-slate-900">{task.title}</span>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {task.estimatedDuration}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{task.learningObjective}</p>
                      <div className="pt-2 flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {task.skill}
                        </span>
                        <span className="text-[10px] text-slate-400">• Phase {task.phase}: {task.phaseName}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200/60">
                <p className="text-xs text-slate-600 font-medium">
                  {hasResume ? 'All active tasks completed! Check your full roadmap.' : 'Upload your resume to generate your step-by-step roadmap.'}
                </p>
                <button
                  onClick={() => setActiveTab(hasResume ? 'roadmap' : 'resume')}
                  className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {hasResume ? 'Open Roadmap' : 'Upload Resume'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Score Breakdown & AI Recommendations */}
        <div className="space-y-6">
          {/* Readiness Score Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Readiness Breakdown
            </h3>

            <div className="space-y-3 text-xs font-semibold">
              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Skill Coverage</span>
                  <span className="font-bold">{readinessScore.breakdown.skillCoverage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-700"
                    style={{ width: `${readinessScore.breakdown.skillCoverage}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Portfolio Quality</span>
                  <span className="font-bold">{readinessScore.breakdown.projectQuality}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${readinessScore.breakdown.projectQuality}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Resume Strength</span>
                  <span className="font-bold">{readinessScore.breakdown.resumeStrength}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${readinessScore.breakdown.resumeStrength}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Interview Preparedness</span>
                  <span className="font-bold">{readinessScore.breakdown.interviewReadiness}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all duration-700"
                    style={{ width: `${readinessScore.breakdown.interviewReadiness}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Score Boost Action Plan */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-900">Highest Score Boost Actions:</p>
              {readinessScore.boostActionPlan.slice(0, 2).map((item, idx) => (
                <div key={idx} className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs">
                  <div className="flex items-center justify-between text-indigo-900 font-bold mb-0.5">
                    <span>{item.action}</span>
                    <span className="bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[10px]">
                      +{item.scoreBoost}% Boost
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-700">Focus on: {item.relatedSkillOrTask}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Project Suggestion */}
          {projects.length > 0 && (
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs text-indigo-300 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <FolderGit2 className="w-4 h-4" /> Recommended Capstone
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded border border-emerald-400/30">
                  +{projects[0].readinessBoostPercentage}% Readiness
                </span>
              </div>

              <h4 className="font-extrabold text-base text-white">{projects[0].projectTitle}</h4>
              <p className="text-xs text-slate-300 line-clamp-2">{projects[0].description}</p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {projects[0].technologies.map(tech => (
                  <span key={tech} className="bg-white/10 text-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded">
                    {tech}
                  </span>
                ))}
              </div>

              <button
                onClick={() => setActiveTab('projects')}
                className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-colors flex items-center justify-center gap-1"
              >
                View Project Blueprint <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
