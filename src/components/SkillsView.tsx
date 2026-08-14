import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Zap, Plus, Trash2, CheckCircle2, Sparkles, Compass } from 'lucide-react';

const SUGGESTED_SKILLS_BY_ROLE: Record<string, string[]> = {
  'Full Stack Developer': ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Docker', 'REST API', 'Tailwind CSS', 'Git'],
  'Software Developer': ['Java', 'C++', 'Python', 'Data Structures', 'Algorithms', 'SQL', 'Git', 'OOP', 'System Design'],
  'AI/ML Engineer': ['Python', 'PyTorch', 'TensorFlow', 'NumPy', 'Pandas', 'Scikit-learn', 'Gemini API', 'Deep Learning'],
  'Data Analyst': ['Python', 'SQL', 'Tableau', 'PowerBI', 'Excel', 'Pandas', 'Statistics', 'Data Visualization'],
  'Cloud Engineer': ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Linux', 'Networking', 'Python', 'CI/CD'],
};

export const SkillsView: React.FC = () => {
  const { profile, addSkill, removeSkill, setActiveTab } = useApp();
  const [inputSkill, setInputSkill] = useState('');

  const suggested = SUGGESTED_SKILLS_BY_ROLE[profile.careerGoal] || [
    'React', 'Node.js', 'TypeScript', 'Python', 'Docker', 'SQL', 'Git'
  ];

  const handleAdd = async (s: string) => {
    if (s.trim()) {
      await addSkill(s.trim());
      setInputSkill('');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
          <Zap className="w-4 h-4" /> Technical & Soft Skill Inventory
        </div>
        <h1 className="text-2xl font-black text-slate-900">Your Technical Skill Portfolio</h1>
        <p className="text-xs text-slate-500 mt-1">
          Add or remove skills. SkillForge AI updates your skill gap analysis and readiness score automatically.
        </p>
      </div>

      {/* Add Skill Input Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900">Add New Skill or Technology</h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={inputSkill}
            onChange={e => setInputSkill(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd(inputSkill);
              }
            }}
            placeholder="e.g. Next.js, Redis, PyTorch, GraphQL..."
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none font-medium"
          />
          <button
            onClick={() => handleAdd(inputSkill)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Skill
          </button>
        </div>

        {/* AI Suggested Quick-Add Pills */}
        <div className="pt-2">
          <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Quick Add Top Industry Skills for <span className="text-indigo-600">{profile.careerGoal}</span>:
          </p>

          <div className="flex flex-wrap gap-2">
            {suggested.map(s => {
              const alreadyHas = profile.currentSkills.includes(s);
              return (
                <button
                  key={s}
                  disabled={alreadyHas}
                  onClick={() => handleAdd(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    alreadyHas
                      ? 'bg-slate-100 text-slate-400 cursor-default opacity-70'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/60'
                  }`}
                >
                  {alreadyHas ? <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> : <Plus className="w-3.5 h-3.5 text-indigo-600" />}
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current Skill Inventory Cards */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900">
            Current Skill Inventory ({profile.currentSkills.length})
          </h3>
          <button
            onClick={() => setActiveTab('gap')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            Analyze Gap <Compass className="w-3.5 h-3.5" />
          </button>
        </div>

        {profile.currentSkills.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Zap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">No skills added yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Use the quick add pills above or type to add skills.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {profile.currentSkills.map(skill => (
              <div
                key={skill}
                className="p-3 bg-slate-50 border border-slate-200/80 hover:border-indigo-300 rounded-xl flex items-center justify-between transition-all group"
              >
                <span className="font-extrabold text-xs text-slate-900 truncate">{skill}</span>
                <button
                  onClick={() => removeSkill(skill)}
                  title="Remove Skill"
                  className="p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
