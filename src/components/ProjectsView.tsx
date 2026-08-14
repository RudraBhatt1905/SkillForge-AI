import React from 'react';
import { useApp } from '../context/AppContext';
import { FolderGit2, Sparkles, CheckCircle2, ArrowUpRight, Code, ShieldCheck } from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const { projects, profile } = useApp();

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
          <FolderGit2 className="w-4 h-4" /> Portfolio Recommendation Engine
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          Recommended Projects for <span className="text-indigo-600">{profile.careerGoal}</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Personalized portfolio projects tailored to demonstrate core engineering skills to recruiters and hiring managers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map(proj => (
          <div
            key={proj.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                  {proj.difficulty} Level
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  +{proj.readinessBoostPercentage}% Score Boost
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900">{proj.projectTitle}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <Code className="w-3.5 h-3.5 text-indigo-600" /> Architecture & Key Features:
                </p>
                <p className="text-[11px] text-slate-600">{proj.architectureOverview}</p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Technologies:</p>
                <div className="flex flex-wrap gap-1.5">
                  {proj.technologies.map(tech => (
                    <span
                      key={tech}
                      className="bg-slate-100 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200/60"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs text-slate-400 font-medium">Time: {proj.estimatedTime}</span>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center gap-1">
                Build & Add to Github <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
