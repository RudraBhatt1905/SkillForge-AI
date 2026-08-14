import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { FullPageAuthScreen } from './components/FullPageAuthScreen';
import { Dashboard } from './components/Dashboard';
import { SkillsView } from './components/SkillsView';
import { SkillGapView } from './components/SkillGapView';
import { RoadmapView } from './components/RoadmapView';
import { ProjectsView } from './components/ProjectsView';
import { CoursesView } from './components/CoursesView';
import { CertificationsView } from './components/CertificationsView';
import { InterviewPrepView } from './components/InterviewPrepView';
import { AIMentorChat } from './components/AIMentorChat';
import { ResumeInsightsView } from './components/ResumeInsightsView';
import { ProfileView } from './components/ProfileView';
import { ProgressView } from './components/ProgressView';
import { SettingsView } from './components/SettingsView';

const AppContent: React.FC = () => {
  const { currentUser, isDemoMode, loading } = useAuth();
  const { activeTab, profile } = useApp();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Automatically prompt onboarding modal for new real users
  useEffect(() => {
    if (currentUser && !isDemoMode && profile && !profile.isOnboarded) {
      setIsOnboardingOpen(true);
    }
  }, [currentUser, isDemoMode, profile?.isOnboarded]);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-500/30 animate-pulse">
          S
        </div>
        <p className="text-sm font-bold text-slate-300">Loading SkillForge AI Portal...</p>
      </div>
    );
  }

  if (!currentUser && !isDemoMode) {
    return <FullPageAuthScreen />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'skills':
        return <SkillsView />;
      case 'gap':
        return <SkillGapView />;
      case 'roadmap':
        return <RoadmapView />;
      case 'projects':
        return <ProjectsView />;
      case 'courses':
        return <CoursesView />;
      case 'certifications':
        return <CertificationsView />;
      case 'interview':
        return <InterviewPrepView />;
      case 'mentor':
        return <AIMentorChat />;
      case 'progress':
        return <ProgressView />;
      case 'resume':
        return <ResumeInsightsView />;
      case 'profile':
        return <ProfileView onOpenOnboarding={() => setIsOnboardingOpen(true)} />;
      case 'settings':
        return <SettingsView onOpenOnboarding={() => setIsOnboardingOpen(true)} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800">
      {/* Sidebar Navigation - Desktop */}
      <div className="hidden md:block h-full shrink-0">
        <Navbar onOpenAuth={() => setIsAuthOpen(true)} />
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative z-10 w-64 bg-white h-full shadow-2xl">
            <Navbar
              mobileOpen={mobileNavOpen}
              setMobileOpen={setMobileNavOpen}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          onOpenMobileMenu={() => setMobileNavOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
