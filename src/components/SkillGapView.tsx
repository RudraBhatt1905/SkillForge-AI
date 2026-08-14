import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Compass,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Sparkles,
  RefreshCw,
  Plus,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const SkillGapView: React.FC = () => {
  const { profile, skillGap, reanalyzeAndRefresh, isAnalyzing, setActiveTab, addSkill } = useApp();
  const [filter, setFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const filteredItems = skillGap.prioritySkills.filter(item => {
    if (filter === 'All') return true;
    return item.gapSeverity === filter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" /> PS-01 AI Skill Gap Engine
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Skill-Gap Analysis for <span className="text-indigo-600">{skillGap.targetRole}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {skillGap.analysisSummary}
          </p>
        </div>

        <button
          onClick={reanalyzeAndRefresh}
          disabled={isAnalyzing}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing Skills...' : 'Re-Analyze Skills'}
        </button>
      </div>

      {/* Skills Matrix Summary Pills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Strong Skills */}
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Strong Skills ({skillGap.strongSkills.length})
            </h3>
            <span className="text-[10px] bg-emerald-200/60 text-emerald-900 font-bold px-2 py-0.5 rounded">
              Verified
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skillGap.strongSkills.map(s => (
              <span
                key={s}
                className="bg-white border border-emerald-200 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-lg shadow-2xs"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Weak Skills */}
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-amber-950 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Needs Improvement ({skillGap.weakSkills.length})
            </h3>
            <span className="text-[10px] bg-amber-200/60 text-amber-900 font-bold px-2 py-0.5 rounded">
              Intermediate
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skillGap.weakSkills.map(s => (
              <span
                key={s}
                className="bg-white border border-amber-200 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-lg shadow-2xs"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-rose-950 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600" /> Missing Role Requirements ({skillGap.missingSkills.length})
            </h3>
            <span className="text-[10px] bg-rose-200/60 text-rose-900 font-bold px-2 py-0.5 rounded">
              Priority
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {skillGap.missingSkills.map(s => (
              <span
                key={s}
                className="bg-white border border-rose-200 text-rose-800 text-xs font-semibold px-2.5 py-1 rounded-lg shadow-2xs"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Priority Skill Gap Table & Filter */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Priority Skill Breakdown</h3>
            <p className="text-xs text-slate-500">AI analysis comparing current proficiencies against target market demands</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {(['All', 'High', 'Medium', 'Low'] as const).map(sev => (
              <button
                key={sev}
                onClick={() => setFilter(sev)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  filter === sev ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {sev} {sev !== 'All' ? 'Gaps' : ''}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredItems.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-indigo-200 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-extrabold text-indigo-700 text-xs shrink-0">
                    {item.skill.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      {item.skill}
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Current: <span className="font-bold text-slate-700">{item.currentLevel}</span> → Required:{' '}
                      <span className="font-bold text-indigo-600">{item.requiredLevel}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      item.gapSeverity === 'High'
                        ? 'bg-rose-100 text-rose-800'
                        : item.gapSeverity === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {item.gapSeverity} Gap Severity
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                <p className="text-slate-700 font-medium">
                  <span className="font-bold text-slate-900">Why it matters:</span> {item.reason}
                </p>
                <p className="text-indigo-900 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="font-bold">Recommended AI Action:</span> {item.recommendedAction}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => {
                    addSkill(item.skill);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Mark as Acquired
                </button>
                <button
                  onClick={() => setActiveTab('roadmap')}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Go to Roadmap Tasks
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
