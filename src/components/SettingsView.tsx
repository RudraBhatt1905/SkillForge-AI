import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Settings, RefreshCw, ShieldCheck, Database, LogOut, UserCheck } from 'lucide-react';

export const SettingsView: React.FC<{ onOpenOnboarding: () => void }> = ({ onOpenOnboarding }) => {
  const { loadDemoModeData, reanalyzeAndRefresh, isAnalyzing, profile } = useApp();
  const { isDemoMode, logout, enableDemoMode } = useAuth();

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" /> Application Settings & Data Management
        </div>
        <h1 className="text-2xl font-black text-slate-900">Settings & Demo Controls</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure profile settings, reset demo datasets, or re-trigger AI career analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reset Demo Data */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" /> Demo Dataset Controls
          </h3>
          <p className="text-xs text-slate-600">
            For hackathon evaluation: reload full pre-populated student profile with complete skill gap, roadmap, courses, and project data.
          </p>

          <button
            onClick={loadDemoModeData}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Reload Hackathon Demo Data
          </button>
        </div>

        {/* AI Analysis Trigger */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" /> Force AI Analysis
          </h3>
          <p className="text-xs text-slate-600">
            Send current student skills, experience level, and career target to Gemini to generate fresh recommendations.
          </p>

          <button
            onClick={reanalyzeAndRefresh}
            disabled={isAnalyzing}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing Skills...' : 'Run Gemini Skill Analysis'}
          </button>
        </div>
      </div>
    </div>
  );
};
