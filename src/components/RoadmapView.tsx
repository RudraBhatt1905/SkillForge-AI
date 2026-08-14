import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TaskStatus } from '../types';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  FolderGit2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Circle,
  PlayCircle,
  Award,
  Trophy,
} from 'lucide-react';

export const RoadmapView: React.FC = () => {
  const { roadmap, updateTaskStatus, profile, readinessScore, isAnalyzing, reanalyzeAndRefresh } = useApp();
  const [expandedPhase, setExpandedPhase] = useState<number>(1);

  const totalTasks = roadmap.flatMap(p => p.tasks).length;
  const completedTasks = roadmap.flatMap(p => p.tasks).filter(t => t.status === 'completed').length;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <BookOpen className="w-4 h-4" /> Personalized Learning Path
            </div>
            <h1 className="text-2xl font-black text-white">
              Roadmap for <span className="text-indigo-400">{profile.careerGoal}</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Phased learning plan created by AI mentor to systematically fill your skill gaps, build projects, and unlock +50 XP per completed task!
            </p>
          </div>

          <div className="bg-white/10 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center shrink-0 min-w-40 text-center">
            <span className="text-3xl font-black text-indigo-400">{progressPct}%</span>
            <span className="text-[10px] uppercase font-bold text-slate-300">Path Progress</span>
            <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-indigo-400 h-full rounded-full transition-all" style={{ width: `${progressPct}%` }}></div>
            </div>
          </div>
        </div>

        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-indigo-600/30 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Phase Cards */}
      <div className="space-y-4">
        {roadmap.map(phase => {
          const isExpanded = expandedPhase === phase.phaseNumber;
          const phaseTasks = phase.tasks;
          const phaseCompleted = phaseTasks.filter(t => t.status === 'completed').length;

          return (
            <div
              key={phase.phaseNumber}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden transition-all"
            >
              {/* Phase Header Toggle */}
              <div
                onClick={() => setExpandedPhase(isExpanded ? 0 : phase.phaseNumber)}
                className="p-5 flex items-center justify-between cursor-pointer bg-slate-50/60 hover:bg-slate-50 transition-colors select-none"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
                    P{phase.phaseNumber}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                      {phase.title}
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                        {phase.durationWeeks}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{phase.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-600 hidden sm:inline">
                    {phaseCompleted} / {phaseTasks.length} Done
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Tasks List */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-100 space-y-4 bg-white">
                  {phaseTasks.map(task => {
                    const isDone = task.status === 'completed';
                    const isInProgress = task.status === 'in_progress';

                    return (
                      <div
                        key={task.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isDone
                            ? 'bg-emerald-50/40 border-emerald-200/80'
                            : isInProgress
                            ? 'bg-indigo-50/40 border-indigo-200'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            {/* Status Checkbox */}
                            <button
                              onClick={() =>
                                updateTaskStatus(task.id, isDone ? 'in_progress' : 'completed')
                              }
                              className="mt-0.5 shrink-0 transition-colors"
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                              ) : isInProgress ? (
                                <PlayCircle className="w-5 h-5 text-indigo-600" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-600" />
                              )}
                            </button>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-slate-900">{task.title}</span>
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                  {task.skill}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600">{task.learningObjective}</p>

                              {/* Resources Links */}
                              {task.resources && task.resources.length > 0 && (
                                <div className="pt-2 flex flex-wrap gap-2">
                                  {task.resources.map((res, idx) => (
                                    <a
                                      key={idx}
                                      href={res.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 text-[11px] font-bold rounded-lg transition-colors shadow-2xs"
                                    >
                                      {res.title} <ExternalLink className="w-3 h-3 text-slate-400" />
                                    </a>
                                  ))}
                                </div>
                              )}

                              {/* Project Assignment */}
                              {task.projectAssignment && (
                                <div className="mt-2 p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs">
                                  <span className="font-extrabold text-indigo-950 flex items-center gap-1">
                                    <FolderGit2 className="w-3.5 h-3.5 text-indigo-600" /> Practical Hands-on Task:
                                  </span>
                                  <p className="text-indigo-800 text-[11px] mt-0.5">
                                    {task.projectAssignment.description}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* XP Badge & Toggle Buttons */}
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Trophy className="w-3 h-3 text-indigo-600" /> +50 XP
                            </span>

                            <button
                              onClick={() =>
                                updateTaskStatus(task.id, isDone ? 'in_progress' : 'completed')
                              }
                              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                                isDone
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                              }`}
                            >
                              {isDone ? 'Completed' : 'Mark Complete'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
