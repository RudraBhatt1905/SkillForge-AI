import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles, Mail, Lock, User, LogIn, UserPlus, ShieldCheck, Check, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, loginWithGoogle, register, resetPassword, enableDemoMode, error, clearError } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

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
      if (!passwordsMatch) return;
      if (!isPasswordValid) return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await register(email, password, fullName);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      // Error is caught and displayed by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      // Error handled by AuthContext
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
      // Error handled
    } finally {
      setIsResetting(false);
    }
  };

  const handleDemoClick = () => {
    enableDemoMode();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Top bar with close button & Judge Mode option */}
        <div className="p-6 pb-2 relative flex items-center justify-between">
          <button
            onClick={handleDemoClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Guest Demo
          </button>
          
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header Content */}
        <div className="px-6 pt-2 pb-4">
          <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl mb-3 shadow-md shadow-indigo-200">
            S
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {isRegistering ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isRegistering
              ? 'Sign up to register your cognitive profile and activate your neural index'
              : 'Sign in to access your AI career roadmap, skill gaps, and interview prep'}
          </p>
        </div>

        {/* Form Body */}
        <div className="px-6 pb-6 space-y-4">
          {error && (
            <div className="text-xs bg-rose-50 text-rose-700 border border-rose-200 p-3.5 rounded-2xl font-semibold animate-in fade-in space-y-2">
              <p>{error}</p>
              <button
                type="button"
                onClick={handleDemoClick}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-100/80 hover:bg-indigo-100 px-2.5 py-1 rounded-xl transition-colors"
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* FULL NAME (Only in Sign Up Mode) */}
            {isRegistering && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required={isRegistering}
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Elena Rostova"
                    className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50/80 border border-slate-200/90 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* EMAIL ADDRESS */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase">
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
                  placeholder="elena@example.com"
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50/80 border border-slate-200/90 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase">
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
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50/80 border border-slate-200/90 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* PASSWORD METRICS (Sign Up Mode) */}
            {isRegistering && (
              <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-3.5 space-y-2.5">
                <p className="text-[10px] font-mono tracking-wider text-slate-500 uppercase font-semibold">
                  Vault Password Metrics
                </p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        hasMinLength ? 'bg-emerald-500 shadow-xs shadow-emerald-200' : 'bg-rose-500 shadow-xs shadow-rose-200'
                      }`}
                    />
                    <span className={hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                      8+ Characters
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        hasUppercase ? 'bg-emerald-500 shadow-xs shadow-emerald-200' : 'bg-rose-500 shadow-xs shadow-rose-200'
                      }`}
                    />
                    <span className={hasUppercase ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                      Uppercase Letter
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        hasLowercase ? 'bg-emerald-500 shadow-xs shadow-emerald-200' : 'bg-rose-500 shadow-xs shadow-rose-200'
                      }`}
                    />
                    <span className={hasLowercase ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                      Lowercase Letter
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        hasNumber ? 'bg-emerald-500 shadow-xs shadow-emerald-200' : 'bg-rose-500 shadow-xs shadow-rose-200'
                      }`}
                    />
                    <span className={hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                      Numeric Digit
                    </span>
                  </div>

                  <div className="flex items-center gap-2 col-span-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        hasSpecial ? 'bg-emerald-500 shadow-xs shadow-emerald-200' : 'bg-rose-500 shadow-xs shadow-rose-200'
                      }`}
                    />
                    <span className={hasSpecial ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                      Special Symbol (!@#$%)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* CONFIRM PASSWORD (Sign Up Mode) */}
            {isRegistering && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase">
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
                    className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50/80 border border-slate-200/90 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-rose-600 text-xs font-semibold flex items-center gap-1.5 mt-1 animate-in fade-in">
                    ✕ Passwords do not match
                  </p>
                )}
              </div>
            )}

            {/* MAIN ACTION BUTTON */}
            <button
              type="submit"
              disabled={loading || (isRegistering && (!passwordsMatch || !isPasswordValid))}
              className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 active:scale-[0.99] text-white rounded-2xl font-extrabold text-sm tracking-wide uppercase transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 mt-2"
            >
              {isRegistering ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  Unlock Vault
                </>
              )}
            </button>
          </form>

          {/* DIVIDER */}
          {!isRegistering && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-[10px] font-mono font-semibold tracking-widest text-slate-400 uppercase">
                    Or Authenticate Via
                  </span>
                </div>
              </div>

              {/* GOOGLE SIGN IN BUTTON */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Sign In With Google Identity
              </button>
            </>
          )}

          {/* TOGGLE SIGN IN / SIGN UP */}
          <div className="pt-2 text-center text-xs text-slate-500 font-medium">
            {isRegistering ? (
              <p>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    clearError();
                    setIsRegistering(false);
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
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
                  className="font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
                >
                  Create Account
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
