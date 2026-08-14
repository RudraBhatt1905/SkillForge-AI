import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/auth';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isDemoMode: boolean;
  error: string | null;
  clearError: () => void;
  enableDemoMode: () => void;
  exitDemoMode: () => void;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, pass: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('skillforge_demo_mode') === 'true';
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      if (user) {
        setIsDemoMode(false);
        localStorage.removeItem('skillforge_demo_mode');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const clearError = () => setError(null);

  const enableDemoMode = () => {
    setIsDemoMode(true);
    localStorage.setItem('skillforge_demo_mode', 'true');
    setError(null);
  };

  const exitDemoMode = () => {
    setIsDemoMode(false);
    localStorage.removeItem('skillforge_demo_mode');
    setError(null);
  };

  const getFriendlyErrorMessage = (errCode: string, defaultMessage: string): string => {
    switch (errCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email address or password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists. Try signing in instead.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'This sign-in method is currently disabled in your Firebase Console. Please enable Email/Password or Google under Authentication > Sign-in method in Firebase, or continue in Guest mode.';
      case 'auth/popup-blocked':
        return 'The Google sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
      case 'auth/popup-closed-by-user':
        return 'The sign-in window was closed before completing. Please try again.';
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized in Firebase Console. Add your Cloud Run app URL to Firebase > Authentication > Settings > Authorized Domains.';
      case 'auth/network-request-failed':
        return 'Network connection failed. Please check your internet connection.';
      default:
        return defaultMessage || 'An unexpected authentication error occurred. Please try again.';
    }
  };

  const login = async (email: string, pass: string) => {
    setError(null);
    try {
      exitDemoMode();
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed') {
        const fallbackName = email ? email.split('@')[0] : 'Student';
        localStorage.setItem('skillforge_registered_user', JSON.stringify({
          name: fallbackName,
          email: email,
        }));
        enableDemoMode();
        return;
      }
      console.warn('Login note:', err?.message || err);
      const friendly = getFriendlyErrorMessage(err?.code, err?.message);
      setError(friendly);
      throw new Error(friendly);
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      exitDemoMode();
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed') {
        enableDemoMode();
        return;
      }
      console.warn('Google Sign-in note:', err?.message || err);
      const friendly = getFriendlyErrorMessage(err?.code, err?.message);
      setError(friendly);
      throw new Error(friendly);
    }
  };

  const register = async (email: string, pass: string, displayName?: string) => {
    setError(null);
    try {
      exitDemoMode();
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user && displayName && displayName.trim()) {
        await updateProfile(res.user, { displayName: displayName.trim() });
      }
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed') {
        const fallbackName = displayName?.trim() || (email ? email.split('@')[0] : 'Student');
        localStorage.setItem('skillforge_registered_user', JSON.stringify({
          name: fallbackName,
          email: email,
        }));
        enableDemoMode();
        return;
      }
      console.warn('Registration note:', err?.message || err);
      const friendly = getFriendlyErrorMessage(err?.code, err?.message);
      setError(friendly);
      throw new Error(friendly);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      exitDemoMode();
      if (currentUser) {
        await signOut(auth);
      }
    } catch (err: any) {
      console.error('Logout error:', err);
      setError('Unable to log out at this time. Please try again.');
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.error('Password reset error:', err);
      const friendly = getFriendlyErrorMessage(err?.code, err?.message);
      setError(friendly);
      throw new Error(friendly);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isDemoMode,
        error,
        clearError,
        enableDemoMode,
        exitDemoMode,
        login,
        loginWithGoogle,
        register,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
