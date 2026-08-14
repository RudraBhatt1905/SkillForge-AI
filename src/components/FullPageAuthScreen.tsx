import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, User, UserPlus, ShieldCheck, ArrowRight, Target, Compass, Award, CheckCircle2 } from 'lucide-react';

export const FullPageAuthScreen: React.FC = () => {
  const { login, loginWithGoogle, register, resetPassword, enableDemoMode, error, clearError } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Password validation checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
  const passwordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (isRegistering) {
      if (!passwordsMatch || !isPasswordValid) return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await register(email, password, fullName);
      } else {
        await login(email, password);
      }
    } catch (err) {
      // Handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      // Handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert('Please enter your email address first.');
      return;
    }
    setIsResetting(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err) {
      // Handled
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 font-sans overflow-x-hidden">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden my-auto">
        
        {/* Left Column: SkillForge AI Branding Banner */}
        <div className="lg:col-span-6 p-8 md:p-12 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80">
          
          <div className="relative z-10 space-y-6">
            {/* Top Brand Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                S
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white block">SkillForge AI</span>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">YOUR PERSONAL AI CAREER MENTOR</span>
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-3 pt-2">
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                Personalized roadmaps, skill gaps & readiness, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">structured & smart</span>.
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed max-w-md">
                Bridge the gap between your current engineering skills and your target dream role with AI-generated milestones, real projects, and resume analysis.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3 pt-4">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Targeted Skill Gap Analysis</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Identifies exact missing technical skills required for your target job profile.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Milestone AI Learning Roadmap</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Step-by-step phases with practical assignments and hands-on capstones.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Career Readiness Score</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Track your placement readiness with AI resume parsing and interview prep.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Left Footer info */}
          <div className="relative z-10 pt-8 mt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Firebase Cloud Sync Enabled
            </span>
            <button
              onClick={enableDemoMode}
              className="text-indigo-400 hover:text-indigo-300 font-bold underline underline-offset-2 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" /> Guest Demo Access
            </button>
          </div>

          {/* Glowing Ambient Backdrop */}
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Right Column: Auth Form */}
        <div className="lg:col-span-6 p-8 md:p-12 bg-white flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* Header / Mode Switcher */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  {isRegistering ? 'Account Registration' : 'Secure Member Login'}
                </span>

                <button
                  onClick={enableDemoMode}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                  Explore Guest Demo Mode
                </button>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {isRegistering ? 'Create your career account' : 'Unlock your career portal'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isRegistering
                  ? 'Sign up to build your custom AI career roadmap and track skill readiness'
                  : 'Welcome back! Sign in to access your synchronized learning portal'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-xs bg-rose-50 text-rose-700 border border-rose-200 p-3.5 rounded-2xl font-semibold space-y-2 animate-in fade-in">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={enableDemoMode}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-100 px-2 py-1 rounded-xl transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Continue in Demo Mode instead →
                </button>
              </div>
            )}

            {resetSent && (
              <div className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 p-3 rounded-2xl font-semibold animate-in fade-in">
                Password reset link sent to your email!
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name (Sign Up) */}
              {isRegistering && (
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required={isRegistering}
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => {
                      clearError();
                      setEmail(e.target.value);
                    }}
                    placeholder="you@domain.com"
                    className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
                    Password
                  </label>
                  {!isRegistering && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={isResetting}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => {
                      clearError();
                      setPassword(e.target.value);
                    }}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password Requirements (Sign Up) */}
              {isRegistering && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password Requirements</p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                    <span className={hasMinLength ? 'text-emerald-600 font-bold' : 'text-slate-400'}>✓ 8+ Characters</span>
                    <span className={hasUppercase ? 'text-emerald-600 font-bold' : 'text-slate-400'}>✓ Uppercase Letter</span>
                    <span className={hasLowercase ? 'text-emerald-600 font-bold' : 'text-slate-400'}>✓ Lowercase Letter</span>
                    <span className={hasNumber ? 'text-emerald-600 font-bold' : 'text-slate-400'}>✓ Number Digit</span>
                    <span className={`col-span-2 ${hasSpecial ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>✓ Special Character (!@#$%)</span>
                  </div>
                </div>
              )}

              {/* Confirm Password (Sign Up) */}
              {isRegistering && (
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required={isRegistering}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-rose-600 text-xs font-semibold mt-1">✕ Passwords do not match</p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (isRegistering && (!passwordsMatch || !isPasswordValid))}
                className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-extrabold text-sm tracking-wide transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <Sparkles className="w-5 h-5 animate-spin" />
                ) : isRegistering ? (
                  <>
                    <UserPlus className="w-4 h-4" /> Create Account
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" /> Unlock Portal
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                  Or Authenticate Via
                </span>
              </div>
            </div>

            {/* Google Sign-In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Sign In With Google Identity
            </button>

            {/* Toggle Mode Footer */}
            <div className="pt-2 text-center text-xs text-slate-500 font-medium">
              {isRegistering ? (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      clearError();
                      setIsRegistering(false);
                    }}
                    className="font-extrabold text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <p>
                  New to SkillForge AI?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      clearError();
                      setIsRegistering(true);
                    }}
                    className="font-extrabold text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
                  >
                    Create Account
                  </button>
                </p>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
