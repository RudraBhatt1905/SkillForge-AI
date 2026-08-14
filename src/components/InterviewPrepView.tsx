import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InterviewTopic } from '../types';
import {
  MessageSquareCode,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Brain,
  Code,
  Users,
  Layers,
  Video,
  Play,
  Award,
  Mic,
} from 'lucide-react';
import { AIRecruiterInterviewModal } from './AIRecruiterInterviewModal';

export const InterviewPrepView: React.FC = () => {
  const { interviewPrep, profile } = useApp();
  const [activeCategory, setActiveCategory] = useState<'Technical' | 'HR' | 'DSA' | 'System Design'>('Technical');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [isAIRecruiterModalOpen, setIsAIRecruiterModalOpen] = useState<boolean>(false);

  const toggleMastered = (id: string) => {
    if (masteredIds.includes(id)) {
      setMasteredIds(masteredIds.filter(i => i !== id));
    } else {
      setMasteredIds([...masteredIds, id]);
    }
  };

  const getQuestionsList = (): InterviewTopic[] => {
    if (activeCategory === 'Technical') return interviewPrep.technicalQuestions;
    if (activeCategory === 'HR') return interviewPrep.hrQuestions;
    return [];
  };

  const questions = getQuestionsList();

  return (
    <div className="space-y-6 pb-12">
      {/* Live AI Recruiter Video Interview Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-7 border border-indigo-500/30 text-white relative overflow-hidden shadow-xl shadow-indigo-950/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-black tracking-wide">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              NEW: LIVE AI RECRUITER VIDEO INTERVIEW
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              Mock Interview with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300">AI Recruiter Sarah</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Start your webcam and practice live verbal mock rounds. The AI recruiter will speak with you in real-time, test your technical & behavioral depth for <strong className="text-white">{profile.careerGoal}</strong>, and deliver an instant hiring scorecard.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                <Video className="w-3.5 h-3.5 text-indigo-400" /> Live Webcam Mirror
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                <Mic className="w-3.5 h-3.5 text-emerald-400" /> Speech & Mic Recognition
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                <Award className="w-3.5 h-3.5 text-amber-400" /> Instant STAR Scorecard
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-center gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={() => setIsAIRecruiterModalOpen(true)}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-sm shadow-lg shadow-indigo-600/40 hover:shadow-indigo-600/60 transition-all flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Video className="w-4 h-4" />
              Start Live Recruiter Video Interview
            </button>
            <span className="text-[11px] text-slate-400 text-center">
              Requires Camera & Mic permissions
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <MessageSquareCode className="w-5 h-5 text-indigo-600" /> Question Bank & Response Frameworks
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore categorized technical questions, DSA topics, and AI-suggested answers for your placement rounds.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveCategory('Technical')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeCategory === 'Technical'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Code className="w-4 h-4" /> Technical & Language ({interviewPrep.technicalQuestions.length})
        </button>

        <button
          onClick={() => setActiveCategory('HR')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeCategory === 'HR'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" /> Behavioral & HR ({interviewPrep.hrQuestions.length})
        </button>

        <button
          onClick={() => setActiveCategory('DSA')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeCategory === 'DSA'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Brain className="w-4 h-4" /> Priority DSA Patterns ({interviewPrep.dsaTopics.length})
        </button>

        <button
          onClick={() => setActiveCategory('System Design')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeCategory === 'System Design'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" /> System Design ({interviewPrep.systemDesignTopics.length})
        </button>
      </div>

      {/* DSA & System Design List View */}
      {activeCategory === 'DSA' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Essential Data Structures & Algorithms Topics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {interviewPrep.dsaTopics.map((topic, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-800 flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                {topic}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeCategory === 'System Design' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">System Design Concepts for Entry Level</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {interviewPrep.systemDesignTopics.map((topic, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm text-slate-800 flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                {topic}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Q&A Accordion Cards for Technical & HR */}
      {(activeCategory === 'Technical' || activeCategory === 'HR') && (
        <div className="space-y-4">
          {questions.map(q => {
            const isExpanded = expandedId === q.id;
            const isMastered = masteredIds.includes(q.id);

            return (
              <div
                key={q.id}
                className={`bg-white rounded-2xl border transition-all ${
                  isMastered ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200/80 shadow-2xs'
                }`}
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                  className="p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                        {q.topic}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          q.difficulty === 'Hard'
                            ? 'bg-rose-100 text-rose-800'
                            : q.difficulty === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900">{q.question}</h3>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleMastered(q.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                        isMastered
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isMastered ? 'Mastered' : 'Mark Mastered'}
                    </button>

                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 border-t border-slate-100 bg-slate-50/60 space-y-4">
                    <div className="space-y-2">
                      <p className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-600" /> AI Suggested Ideal Response Framework:
                      </p>
                      <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                        {q.aiSuggestedAnswer}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-900 mb-2">Key Talking Points to Mention:</p>
                      <div className="flex flex-wrap gap-2">
                        {q.keyPoints.map((pt, idx) => (
                          <span
                            key={idx}
                            className="bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs font-semibold px-3 py-1 rounded-lg"
                          >
                            • {pt}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* AI Recruiter Live Video Modal */}
      <AIRecruiterInterviewModal
        isOpen={isAIRecruiterModalOpen}
        onClose={() => setIsAIRecruiterModalOpen(false)}
      />
    </div>
  );
};

