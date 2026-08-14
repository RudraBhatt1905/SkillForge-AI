import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CareerRole, ExperienceLevel } from '../types';
import { X, Target, GraduationCap, Sparkles, Check, Plus, Trash2 } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CAREER_ROLES: CareerRole[] = [
  'Full Stack Developer',
  'Software Developer',
  'AI/ML Engineer',
  'Data Analyst',
  'Data Scientist',
  'Cloud Engineer',
  'DevOps Engineer',
  'Cybersecurity Engineer',
  'UI/UX Designer',
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile, reanalyzeAndRefresh } = useApp();

  const [name, setName] = useState(profile.name || '');
  const [college, setCollege] = useState(profile.college || '');
  const [degree, setDegree] = useState(profile.degree || 'B.Tech');
  const [branch, setBranch] = useState(profile.branch || '');
  const [yearOfStudy, setYearOfStudy] = useState(profile.yearOfStudy || '2nd Year');
  const [careerGoal, setCareerGoal] = useState<CareerRole>(profile.careerGoal || 'Full Stack Developer');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(profile.experienceLevel || 'Beginner');
  const [skills, setSkills] = useState<string[]>(profile.currentSkills || []);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (s: string) => {
    setSkills(skills.filter(sk => sk !== s));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name,
        college,
        degree,
        branch,
        yearOfStudy,
        careerGoal,
        experienceLevel,
        currentSkills: skills,
        isOnboarded: true,
      });

      // Refresh AI analysis to generate new skill gap and roadmap for updated profile
      await reanalyzeAndRefresh();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Personalize AI Mentor
          </div>
          <h3 className="text-xl font-extrabold text-white">Student Career Profile & Goals</h3>
          <p className="text-xs text-slate-400 mt-1">
            SkillForge AI uses this information to analyze skill gaps and generate a dynamic, tailored roadmap.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Basic Info */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" /> Academic Profile
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">College / University</label>
                <input
                  type="text"
                  required
                  value={college}
                  onChange={e => setCollege(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Degree & Branch</label>
                <input
                  type="text"
                  required
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Year</label>
                <select
                  value={yearOfStudy}
                  onChange={e => setYearOfStudy(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year / Final">4th Year / Final</option>
                  <option value="Postgraduate / Master's">Postgraduate / Master's</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Career Goal & Level */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" /> Career Goal & Target Role
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Career Role</label>
                <select
                  value={careerGoal}
                  onChange={e => setCareerGoal(e.target.value as CareerRole)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none font-semibold text-slate-800"
                >
                  {CAREER_ROLES.map(role => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={e => setExperienceLevel(e.target.value as ExperienceLevel)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
                >
                  <option value="Beginner">Beginner (Starting fundamentals)</option>
                  <option value="Intermediate">Intermediate (Building projects)</option>
                  <option value="Advanced">Advanced (Preparing for interviews)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Current Technical Skills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Your Current Skills</label>
            <p className="text-[11px] text-slate-500 mb-2">
              Add programming languages, frameworks, databases, or tools you know.
            </p>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSkillInput}
                onChange={e => setNewSkillInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="e.g. Docker, TypeScript, PostgreSQL..."
                className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-100">
              {skills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg shadow-2xs"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-200 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Generating AI Analysis...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Save & Recalculate AI Path
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
