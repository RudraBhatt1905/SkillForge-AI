import React from 'react';
import { useApp } from '../context/AppContext';
import { LineChart, Trophy, Flame, Target, Sparkles, CheckCircle2 } from 'lucide-react';

export const ProgressView: React.FC = () => {
  const { profile, readinessScore, roadmap, skillGap } = useApp();

  const totalTasks = roadmap.flatMap(p => p.tasks).length;
  const completedTasks = roadmap.flatMap(p => p.tasks).filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
          <LineChart className="w-4 h-4" /> Learning Analytics & Milestone Tracker
        </div>
        <h1 className="text-2xl font-black text-slate-900">Career Growth Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">
          Track your overall roadmap progress, level progression, and career readiness timeline.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Roadmap Completion Bar Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Roadmap Task Completion</h3>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Tasks Mastered</span>
              <span className="text-indigo-600 font-extrabold">{completedTasks} / {totalTasks} ({totalTasks > 0 ? Math.round((completedTasks/totalTasks)*100) : 0}%)</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{ width: `${totalTasks > 0 ? (completedTasks/totalTasks)*100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-800">Milestone Status:</p>
            <p>Phase 1 Foundation: <span className="font-bold text-emerald-600">In Progress</span></p>
            <p>Phase 2 Core Portfolio: <span className="font-bold text-amber-600 font-bold">Next Up</span></p>
          </div>
        </div>

        {/* Level Progression */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Student XP & Level Progress</h3>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>{profile.levelTitle}</span>
              <span className="text-indigo-600 font-extrabold">{profile.xp} XP</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (profile.xp / 1000) * 100)}%` }}
              ></div>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Earn +50 XP per roadmap assignment completed and +100 XP when uploading resume updates.
          </p>
        </div>
      </div>
    </div>
  );
};
