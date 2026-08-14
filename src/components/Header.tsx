import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Flame, Trophy, Sparkles, RefreshCw, Menu, UserCheck, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenAuth: () => void;
  onOpenOnboarding: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, onOpenAuth, onOpenOnboarding }) => {
  const { profile, readinessScore, isAnalyzing, reanalyzeAndRefresh } = useApp();
  const { currentUser, isDemoMode, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-xs">
      {/* Left Title / Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base md:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Welcome back, {profile.name || 'Student'}
            <span className="hidden sm:inline-flex bg-emerald-50 text-emerald-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
              {profile.levelTitle || 'Lvl 4: Rising Dev'}
            </span>
          </h2>
          <p className="text-[11px] text-slate-500 hidden md:block">
            Targeting <span className="font-bold text-indigo-600">{profile.careerGoal}</span> • {profile.college || profile.branch || 'Engineering Undergrad'}
          </p>
        </div>
      </div>

      {/* Right Stats & Actions */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Streak */}
        <div className="flex items-center gap-1.5 text-xs font-bold bg-orange-50 text-orange-700 px-3 py-1.5 rounded-xl border border-orange-200/60 shadow-2xs">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
          <span>{profile.streakDays} Day Streak</span>
        </div>

        {/* XP */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl border border-indigo-200/60">
          <Trophy className="w-4 h-4 text-indigo-600" />
          <span>{profile.xp} XP</span>
        </div>

        {/* Refresh AI Analysis */}
        <button
          onClick={reanalyzeAndRefresh}
          disabled={isAnalyzing}
          title="Recalculate Skill Gap & AI Recommendations"
          className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-slate-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin text-indigo-600' : ''}`} />
        </button>

        {/* Auth status buttons */}
        {!currentUser && !isDemoMode ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Sign In
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenOnboarding}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              Edit Goal
            </button>

            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 border-2 border-white shadow-xs flex items-center justify-center font-bold text-white text-sm">
              {profile.name ? profile.name.charAt(0) : 'A'}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
