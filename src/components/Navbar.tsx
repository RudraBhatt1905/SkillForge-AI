import React from 'react';
import { useApp, NavigationTab } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Compass,
  Zap,
  BookOpen,
  FolderGit2,
  GraduationCap,
  Award,
  MessageSquareCode,
  LineChart,
  FileText,
  User,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface NavbarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ mobileOpen, setMobileOpen, onOpenAuth }) => {
  const { activeTab, setActiveTab, profile } = useApp();
  const { currentUser, isDemoMode, logout, enableDemoMode } = useAuth();

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'skills', label: 'My Skills', icon: <Zap className="w-5 h-5" /> },
    { id: 'gap', label: 'Skill Gap', icon: <Compass className="w-5 h-5" /> },
    { id: 'roadmap', label: 'Learning Roadmap', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'projects', label: 'Projects', icon: <FolderGit2 className="w-5 h-5" /> },
    { id: 'courses', label: 'Courses', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'certifications', label: 'Certifications', icon: <Award className="w-5 h-5" /> },
    { id: 'interview', label: 'Interview Prep', icon: <MessageSquareCode className="w-5 h-5" /> },
    { id: 'mentor', label: 'AI Mentor', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'progress', label: 'Progress', icon: <LineChart className="w-5 h-5" /> },
    { id: 'resume', label: 'Resume Insights', icon: <FileText className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleSelect = (tab: NavigationTab) => {
    setActiveTab(tab);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 z-30">
      {/* Brand & Logo */}
      <div className="p-5 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleSelect('dashboard')}>
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-200">
            S
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1">
              SkillForge <span className="text-indigo-600 font-black">AI</span>
            </span>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">Personal Career Mentor</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {isActive && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>}
            </button>
          );
        })}
      </nav>

      {/* HackOrbit & Mode Banner */}
      <div className="p-3">
        <div className="bg-slate-900 text-white rounded-2xl p-4 relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">HackOrbit 2026</span>
              <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-indigo-400/30">
                PS-01
              </span>
            </div>
            <p className="text-sm font-bold text-white mb-1">Career Mentor Pro</p>
            <p className="text-[11px] text-slate-400 mb-3 line-clamp-1">Personalized path for {profile.careerGoal}</p>
            
            {!currentUser && !isDemoMode ? (
              <button
                onClick={enableDemoMode}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-colors shadow-md shadow-indigo-900/50 flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Launch Demo Mode
              </button>
            ) : (
              <button
                onClick={() => handleSelect('mentor')}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-colors shadow-md shadow-indigo-900/50 flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ask AI Mentor
              </button>
            )}
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* User profile / Logout */}
        {(currentUser || isDemoMode) && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-1">
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-700 uppercase">
                {profile.name.charAt(0)}
              </div>
              <div className="truncate">
                <p className="font-bold text-slate-800 text-xs truncate">{profile.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{profile.degree || profile.careerGoal}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
