import React from 'react';
import { useApp } from '../context/AppContext';
import { User, Trophy, Flame, GraduationCap, Target, Award, Sparkles, MapPin, Mail, Calendar } from 'lucide-react';

export const ProfileView: React.FC<{ onOpenOnboarding: () => void }> = ({ onOpenOnboarding }) => {
  const { profile } = useApp();

  return (
    <div className="space-y-6 pb-12">
      {/* Header Profile Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 border-4 border-white/20 shadow-xl flex items-center justify-center font-black text-white text-3xl shrink-0">
            {profile.name ? profile.name.charAt(0) : 'S'}
          </div>

          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-white">{profile.name}</h1>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-0.5 rounded-full border border-emerald-400/30">
                {profile.levelTitle}
              </span>
            </div>

            <p className="text-sm text-indigo-300 font-semibold">
              Target Career: <span className="text-white font-extrabold">{profile.careerGoal}</span>
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300 pt-2">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4 text-indigo-400" /> {profile.college || 'Engineering College'} ({profile.branch})
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-indigo-400" /> {profile.location || 'India'}
              </span>
            </div>
          </div>

          <button
            onClick={onOpenOnboarding}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-900/50 shrink-0"
          >
            Edit Profile & Goal
          </button>
        </div>

        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-indigo-600/30 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Gamification & Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
              <Flame className="w-5 h-5 fill-orange-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500">Learning Streak</p>
              <p className="text-xl font-black text-slate-900">{profile.streakDays} Days</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">Keep completing roadmap tasks daily to protect your streak!</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500">Total XP</p>
              <p className="text-xl font-black text-slate-900">{profile.xp} XP</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">Earn +50 XP per roadmap task and +100 XP per resume analysis.</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500">Earned Badges</p>
              <p className="text-xl font-black text-slate-900">{profile.badges.length} Badges</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">Unlock new badges as your career readiness score increases.</p>
        </div>
      </div>

      {/* Badges Collection */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="text-base font-extrabold text-slate-900">Student Badges & Milestones</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {profile.badges.map(b => (
            <div key={b.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0">
                {b.icon || '🏅'}
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-900">{b.title}</h4>
                <p className="text-[11px] text-slate-500">{b.description}</p>
                <span className="text-[9px] text-indigo-600 font-bold">Earned: {b.earnedDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
