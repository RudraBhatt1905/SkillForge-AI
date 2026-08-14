import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  StudentProfile,
  SkillGapAnalysis,
  RoadmapPhase,
  CourseRecommendation,
  ProjectRecommendation,
  CertificationRecommendation,
  InterviewPrepPlan,
  CareerReadinessScore,
  ResumeInsights,
  TaskStatus,
} from '../types';
import { useAuth } from './AuthContext';
import {
  getUserProfile,
  saveUserProfile,
  subscribeUserProfile,
} from '../services/userService';
import {
  saveSkillToFirestore,
  deleteSkillFromFirestore,
} from '../services/skillService';
import {
  saveFullRoadmapToFirestore,
  updateRoadmapTaskStatusInFirestore,
  getRoadmapFromFirestore,
  subscribeRoadmap,
} from '../services/roadmapService';
import {
  syncProjectsToFirestore,
  subscribeProjects,
} from '../services/projectService';
import {
  saveRecommendationsToFirestore,
  getRecommendationsFromFirestore,
} from '../services/recommendationService';
import {
  logDailyProgressInFirestore,
} from '../services/progressService';
import {
  uploadResumeToStorage,
  saveResumeAnalysisToFirestore,
  getResumeAnalysisFromFirestore,
} from '../services/resumeService';
import {
  saveInterviewPrepToFirestore,
} from '../services/interviewService';
import {
  saveCareerReadinessToFirestore,
  getCareerReadinessFromFirestore,
  saveSkillGapToFirestore,
  getSkillGapFromFirestore,
} from '../services/careerService';
import {
  generateSkillGapAnalysis,
  generatePersonalizedRoadmap,
  generateRecommendations,
  generateInterviewPrep,
  calculateCareerReadinessScore,
  analyzeResumeAndExtract,
  generateResumeImprovements,
} from '../services/geminiService';

export type NavigationTab =
  | 'dashboard'
  | 'skills'
  | 'gap'
  | 'roadmap'
  | 'projects'
  | 'courses'
  | 'certifications'
  | 'interview'
  | 'mentor'
  | 'progress'
  | 'resume'
  | 'profile'
  | 'settings';

interface AppContextType {
  profile: StudentProfile;
  skillGap: SkillGapAnalysis;
  roadmap: RoadmapPhase[];
  courses: CourseRecommendation[];
  projects: ProjectRecommendation[];
  certifications: CertificationRecommendation[];
  interviewPrep: InterviewPrepPlan;
  readinessScore: CareerReadinessScore;
  resumeInsights: ResumeInsights;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isAnalyzing: boolean;
  
  // State Mutators
  updateProfile: (updated: Partial<StudentProfile>) => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  addSkill: (skill: string) => Promise<void>;
  removeSkill: (skill: string) => Promise<void>;
  handleResumeUpload: (fileName: string, textContent: string, fileObject?: File) => Promise<void>;
  reanalyzeAndRefresh: () => Promise<void>;
  loadDemoModeData: () => void;
}

const EMPTY_PROFILE: StudentProfile = {
  uid: '',
  name: '',
  email: '',
  college: '',
  degree: 'B.Tech',
  branch: 'Computer Science',
  yearOfStudy: '3rd Year',
  location: '',
  careerGoal: 'Full Stack Developer',
  currentSkills: [],
  interests: [],
  experienceLevel: 'Beginner',
  xp: 0,
  level: 1,
  levelTitle: 'Lvl 1: Novice Explorer',
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  badges: [],
  isOnboarded: false,
  updatedAt: new Date().toISOString(),
};

const EMPTY_SKILL_GAP: SkillGapAnalysis = {
  targetRole: 'Full Stack Developer',
  overallMatchPercentage: 0,
  analysisSummary: 'Upload your resume to calculate your exact skill gap and matching score.',
  strongSkills: [],
  weakSkills: [],
  missingSkills: [],
  prioritySkills: [],
};

const EMPTY_READINESS_SCORE: CareerReadinessScore = {
  overallScore: 0,
  breakdown: {
    skillCoverage: 0,
    projectQuality: 0,
    resumeStrength: 0,
    interviewReadiness: 0,
    roadmapProgress: 0,
  },
  positiveFactors: [],
  negativeFactors: ['Resume pending analysis.'],
  boostActionPlan: [
    {
      action: 'Upload your resume to generate tailored readiness insights',
      scoreBoost: 30,
      relatedSkillOrTask: 'Resume Upload',
    },
  ],
  scoreExplanation: 'Upload your resume to calculate your placement readiness score and tailored roadmap.',
};

const EMPTY_INTERVIEW_PREP: InterviewPrepPlan = {
  dsaTopics: [],
  technicalQuestions: [],
  hrQuestions: [],
  systemDesignTopics: [],
  mockTopics: [],
};

const EMPTY_RESUME_INSIGHTS: ResumeInsights = {
  healthScore: 0,
  strengths: [],
  weaknesses: ['Upload your resume to generate your ATS score and keyword analysis.'],
  missingKeywords: [],
  formattingSuggestions: [],
  projectImprovementSuggestions: [],
  improvedBulletPoints: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isDemoMode } = useAuth();
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Core state defaults to clean empty values
  const [profile, setProfile] = useState<StudentProfile>(EMPTY_PROFILE);
  const [skillGap, setSkillGap] = useState<SkillGapAnalysis>(EMPTY_SKILL_GAP);
  const [roadmap, setRoadmap] = useState<RoadmapPhase[]>([]);
  const [courses, setCourses] = useState<CourseRecommendation[]>([]);
  const [projects, setProjects] = useState<ProjectRecommendation[]>([]);
  const [certifications, setCertifications] = useState<CertificationRecommendation[]>([]);
  const [interviewPrep, setInterviewPrep] = useState<InterviewPrepPlan>(EMPTY_INTERVIEW_PREP);
  const [readinessScore, setReadinessScore] = useState<CareerReadinessScore>(EMPTY_READINESS_SCORE);
  const [resumeInsights, setResumeInsights] = useState<ResumeInsights>(EMPTY_RESUME_INSIGHTS);

  // Sync state with Firestore on user login or fallback to demo
  useEffect(() => {
    if (isDemoMode) {
      loadDemoModeData();
      return;
    }

    if (!currentUser) {
      setProfile(EMPTY_PROFILE);
      setSkillGap(EMPTY_SKILL_GAP);
      setRoadmap([]);
      setCourses([]);
      setProjects([]);
      setCertifications([]);
      setInterviewPrep(EMPTY_INTERVIEW_PREP);
      setReadinessScore(EMPTY_READINESS_SCORE);
      setResumeInsights(EMPTY_RESUME_INSIGHTS);
      return;
    }

    let unsubProfile: (() => void) | undefined;
    let unsubRoadmap: (() => void) | undefined;
    let unsubProjects: (() => void) | undefined;

    const fetchAndSubscribeUserData = async () => {
      try {
        const uid = currentUser.uid;
        let userProf = await getUserProfile(uid);

        const defaultName = currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Student');

        if (!userProf) {
          userProf = {
            uid,
            name: defaultName,
            email: currentUser.email || '',
            college: '',
            degree: 'B.Tech',
            branch: 'Computer Science',
            yearOfStudy: '3rd Year',
            location: '',
            careerGoal: 'Full Stack Developer',
            currentSkills: [],
            interests: [],
            experienceLevel: 'Beginner',
            xp: 0,
            level: 1,
            levelTitle: 'Lvl 1: Novice Explorer',
            streakDays: 1,
            lastActiveDate: new Date().toISOString().split('T')[0],
            badges: [],
            isOnboarded: false,
            updatedAt: new Date().toISOString(),
          };
          await saveUserProfile(uid, userProf);
        } else if (
          userProf.name === 'Aarav Mehta' ||
          userProf.name.includes('Aarav') ||
          !userProf.name ||
          (currentUser.displayName && userProf.name !== currentUser.displayName)
        ) {
          const updatedName = currentUser.displayName || defaultName;
          userProf = { ...userProf, name: updatedName };
          await saveUserProfile(uid, { name: updatedName });
        }

        setProfile(userProf);

        // Load cached skill gap & readiness score from Firestore if present
        const savedGapDoc = await getSkillGapFromFirestore(uid);
        if (savedGapDoc) {
          setSkillGap({
            targetRole: savedGapDoc.targetRole || userProf.careerGoal || 'Full Stack Developer',
            strongSkills: savedGapDoc.currentSkills || userProf.currentSkills,
            weakSkills: savedGapDoc.weakSkills || [],
            missingSkills: savedGapDoc.missingSkills || [],
            prioritySkills: (savedGapDoc.prioritySkills || []).map(s => ({
              skill: s.skill,
              category: 'Technical',
              currentLevel: (s.currentLevel as any) || 'Beginner',
              requiredLevel: (s.requiredLevel as any) || 'Intermediate',
              gapSeverity: (s.gap as any) || 'Medium',
              priority: (s.priority as any) || 'High',
              status: s.currentLevel === 'None' ? 'Missing' : 'Weak',
              reason: s.explanation || '',
              recommendedAction: s.explanation || '',
            })),
            overallMatchPercentage: userProf.currentSkills.length > 0 ? 60 : 0,
            analysisSummary: `Custom skill gap breakdown for ${savedGapDoc.targetRole}`,
          });
        } else if (userProf.currentSkills.length > 0) {
          const gap = await generateSkillGapAnalysis(userProf);
          setSkillGap(gap);
        } else {
          setSkillGap(EMPTY_SKILL_GAP);
        }

        const savedReadiness = await getCareerReadinessFromFirestore(uid);
        if (savedReadiness) {
          setReadinessScore({
            overallScore: savedReadiness.score || 0,
            breakdown: {
              skillCoverage: savedReadiness.skillScore || 0,
              projectQuality: savedReadiness.projectScore || 0,
              resumeStrength: savedReadiness.resumeScore || 0,
              interviewReadiness: savedReadiness.interviewScore || 0,
              roadmapProgress: savedReadiness.roadmapScore || 0,
            },
            positiveFactors: savedReadiness.strengths || [],
            negativeFactors: savedReadiness.weaknesses || [],
            boostActionPlan: (savedReadiness.improvementSuggestions || []).map((s, i) => ({
              action: s,
              scoreBoost: 8 - i,
              relatedSkillOrTask: 'Skill Development',
            })),
            scoreExplanation: `Your current Career Readiness Score is ${savedReadiness.score}/100.`,
          });
        } else {
          setReadinessScore(EMPTY_READINESS_SCORE);
        }

        // Subscribe to real-time profile updates
        unsubProfile = subscribeUserProfile(uid, updatedP => {
          if (updatedP) setProfile(updatedP);
        });

        // Subscribe to real-time roadmap updates
        const cachedRoadmap = await getRoadmapFromFirestore(uid, []);
        if (cachedRoadmap && cachedRoadmap.length > 0) {
          setRoadmap(cachedRoadmap);
        } else {
          setRoadmap([]);
        }
        unsubRoadmap = subscribeRoadmap(uid, [], updatedPhases => {
          if (updatedPhases && updatedPhases.length > 0) {
            setRoadmap(updatedPhases);
          }
        });

        // Subscribe to real-time projects updates
        unsubProjects = subscribeProjects(uid, updatedProjs => {
          if (updatedProjs && updatedProjs.length > 0) {
            setProjects(updatedProjs);
          } else {
            setProjects([]);
          }
        });

        // Fetch stored recommendations
        const recs = await getRecommendationsFromFirestore(uid);
        setCourses(recs.courses || []);
        if (recs.projects && recs.projects.length > 0) setProjects(recs.projects);
        setCertifications(recs.certifications || []);

        // Fetch resume analysis
        const resumeAnalysis = await getResumeAnalysisFromFirestore(uid);
        if (resumeAnalysis) {
          setResumeInsights({
            healthScore: 82,
            strengths: resumeAnalysis.strengths || [],
            weaknesses: resumeAnalysis.weaknesses || [],
            missingKeywords: resumeAnalysis.inferredSkills || [],
            formattingSuggestions: resumeAnalysis.suggestions || [],
            projectImprovementSuggestions: [],
            improvedBulletPoints: [],
          });
        } else {
          setResumeInsights(EMPTY_RESUME_INSIGHTS);
        }
      } catch (err) {
        console.error('Error fetching user data from Firestore:', err);
      }
    };

    fetchAndSubscribeUserData();

    return () => {
      if (unsubProfile) unsubProfile();
      if (unsubRoadmap) unsubRoadmap();
      if (unsubProjects) unsubProjects();
    };
  }, [currentUser, isDemoMode]);

  const loadDemoModeData = () => {
    // If a resume has been uploaded before, load it from localStorage
    const cachedResume = localStorage.getItem('skillforge_cached_resume');
    if (cachedResume) {
      try {
        const parsed = JSON.parse(cachedResume);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.skillGap) setSkillGap(parsed.skillGap);
        if (parsed.roadmap) setRoadmap(parsed.roadmap);
        if (parsed.courses) setCourses(parsed.courses);
        if (parsed.projects) setProjects(parsed.projects);
        if (parsed.certifications) setCertifications(parsed.certifications);
        if (parsed.interviewPrep) setInterviewPrep(parsed.interviewPrep);
        if (parsed.readinessScore) setReadinessScore(parsed.readinessScore);
        if (parsed.resumeInsights) setResumeInsights(parsed.resumeInsights);
        return;
      } catch (e) {
        // Fall through
      }
    }

    const registeredUserRaw = localStorage.getItem('skillforge_registered_user');
    let guestName = 'Student';
    let guestEmail = 'student@skillforge.ai';
    if (registeredUserRaw) {
      try {
        const parsedReg = JSON.parse(registeredUserRaw);
        if (parsedReg.name) guestName = parsedReg.name;
        if (parsedReg.email) guestEmail = parsedReg.email;
      } catch (e) {
        // ignore
      }
    }

    // Default clean profile for Guest / Student mode
    const cleanGuestProfile: StudentProfile = {
      uid: 'guest_user',
      name: guestName,
      email: guestEmail,
      college: '',
      degree: 'B.Tech',
      branch: 'Computer Science',
      yearOfStudy: '3rd Year',
      location: '',
      careerGoal: 'Full Stack Developer',
      currentSkills: [],
      interests: [],
      experienceLevel: 'Beginner',
      xp: 0,
      level: 1,
      levelTitle: 'Lvl 1: Novice Explorer',
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      badges: [],
      isOnboarded: true,
      updatedAt: new Date().toISOString(),
    };

    setProfile(cleanGuestProfile);
    setSkillGap(EMPTY_SKILL_GAP);
    setRoadmap([]);
    setCourses([]);
    setProjects([]);
    setCertifications([]);
    setInterviewPrep(EMPTY_INTERVIEW_PREP);
    setReadinessScore(EMPTY_READINESS_SCORE);
    setResumeInsights(EMPTY_RESUME_INSIGHTS);
  };

  const reanalyzeAndRefresh = async () => {
    setIsAnalyzing(true);
    try {
      const gap = await generateSkillGapAnalysis(profile);
      const rdmap = await generatePersonalizedRoadmap(profile, gap);
      const recs = await generateRecommendations(profile, gap);
      const iprep = await generateInterviewPrep(profile);
      const score = calculateCareerReadinessScore(profile, gap, rdmap);

      setSkillGap(gap);
      setRoadmap(rdmap);
      if (recs.courses) setCourses(recs.courses);
      if (recs.projects) setProjects(recs.projects);
      if (recs.certifications) setCertifications(recs.certifications);
      setInterviewPrep(iprep);
      setReadinessScore(score);

      if (currentUser && !isDemoMode) {
        const uid = currentUser.uid;
        await saveSkillGapToFirestore(uid, gap);
        await saveFullRoadmapToFirestore(uid, rdmap, profile.careerGoal);
        await saveRecommendationsToFirestore(uid, recs.courses || [], recs.projects || [], recs.certifications || []);
        if (recs.projects) await syncProjectsToFirestore(uid, recs.projects);
        await saveInterviewPrepToFirestore(uid, iprep);
        await saveCareerReadinessToFirestore(uid, score);
      }
    } catch (e) {
      console.error('Error re-analyzing skills:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateProfile = async (updatedFields: Partial<StudentProfile>) => {
    const updatedProf: StudentProfile = {
      ...profile,
      ...updatedFields,
      updatedAt: new Date().toISOString(),
    };
    setProfile(updatedProf);

    if (currentUser && !isDemoMode) {
      await saveUserProfile(currentUser.uid, updatedProf);
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    let taskCompletedJustNow = false;

    const updatedRoadmap = roadmap.map(phase => {
      const updatedTasks = phase.tasks.map(task => {
        if (task.id === taskId) {
          if (task.status !== 'completed' && status === 'completed') {
            taskCompletedJustNow = true;
          }
          return { ...task, status };
        }
        return task;
      });
      return { ...phase, tasks: updatedTasks };
    });

    setRoadmap(updatedRoadmap);

    let newProfile = profile;
    if (taskCompletedJustNow) {
      const newXp = (profile.xp || 0) + 50;
      const newLevel = Math.floor(newXp / 300) + 1;
      const levelTitle = newLevel >= 5 ? 'Lvl 5: Senior Architect' : newLevel >= 4 ? 'Lvl 4: Rising Dev' : newLevel >= 3 ? 'Lvl 3: Code Ninja' : 'Lvl 2: Apprentice';
      newProfile = {
        ...profile,
        xp: newXp,
        level: newLevel,
        levelTitle,
      };
      setProfile(newProfile);
    }

    const updatedScore = calculateCareerReadinessScore(newProfile, skillGap, updatedRoadmap);
    setReadinessScore(updatedScore);

    if (currentUser && !isDemoMode) {
      const uid = currentUser.uid;
      await updateRoadmapTaskStatusInFirestore(uid, taskId, status, updatedRoadmap);
      if (taskCompletedJustNow) {
        await saveUserProfile(uid, newProfile);
        await logDailyProgressInFirestore(uid, {
          date: new Date().toISOString().split('T')[0],
          learningHours: 1.5,
          tasksCompleted: 1,
          skillsImproved: 1,
          projectsCompleted: 0,
          xpEarned: 50,
        });
      }
      await saveCareerReadinessToFirestore(uid, updatedScore);
    }
  };

  const addSkill = async (newSkill: string) => {
    if (!newSkill || profile.currentSkills.includes(newSkill)) return;
    const updatedSkills = [...profile.currentSkills, newSkill];
    await updateProfile({ currentSkills: updatedSkills });

    if (currentUser && !isDemoMode) {
      await saveSkillToFirestore(currentUser.uid, newSkill, {
        source: 'manual',
        currentLevel: 'Beginner',
      });
    }
  };

  const removeSkill = async (skillToRemove: string) => {
    const updatedSkills = profile.currentSkills.filter(s => s !== skillToRemove);
    await updateProfile({ currentSkills: updatedSkills });

    if (currentUser && !isDemoMode) {
      await deleteSkillFromFirestore(currentUser.uid, skillToRemove);
    }
  };

  const handleResumeUpload = async (fileName: string, textContent: string, fileObject?: File) => {
    setIsAnalyzing(true);
    try {
      if (currentUser && !isDemoMode && fileObject) {
        try {
          await uploadResumeToStorage(currentUser.uid, fileObject);
        } catch (e) {
          console.warn('Storage upload note:', e);
        }
      }

      const extracted = await analyzeResumeAndExtract(textContent, profile);
      extracted.fileName = fileName;

      // Merge extracted skills with current skills
      const mergedSkills = extracted.technicalSkills.length > 0 ? extracted.technicalSkills : profile.currentSkills;

      const updatedProf: StudentProfile = {
        ...profile,
        name: (extracted.candidateName && !extracted.candidateName.includes('Aarav Mehta')) ? extracted.candidateName : (profile.name || 'Student'),
        college: extracted.education.college || profile.college,
        degree: extracted.education.degree || profile.degree,
        branch: extracted.education.branch || profile.branch,
        yearOfStudy: extracted.education.yearOfStudy || profile.yearOfStudy,
        currentSkills: mergedSkills,
        resume: extracted,
        xp: (profile.xp || 0) + 100, // +100 XP bonus for uploading resume!
      };

      setProfile(updatedProf);

      const insights = await generateResumeImprovements(textContent, updatedProf);
      setResumeInsights(insights);

      const gap = await generateSkillGapAnalysis(updatedProf);
      setSkillGap(gap);

      const rdmap = await generatePersonalizedRoadmap(updatedProf, gap);
      setRoadmap(rdmap);

      const recs = await generateRecommendations(updatedProf, gap);
      if (recs.courses) setCourses(recs.courses);
      if (recs.projects) setProjects(recs.projects);
      if (recs.certifications) setCertifications(recs.certifications);

      const iprep = await generateInterviewPrep(updatedProf);
      setInterviewPrep(iprep);

      const score = calculateCareerReadinessScore(updatedProf, gap, rdmap);
      setReadinessScore(score);

      // Save to localStorage
      localStorage.setItem('skillforge_cached_resume', JSON.stringify({
        profile: updatedProf,
        skillGap: gap,
        roadmap: rdmap,
        courses: recs.courses,
        projects: recs.projects,
        certifications: recs.certifications,
        interviewPrep: iprep,
        readinessScore: score,
        resumeInsights: insights,
      }));

      // If user is logged into Firebase, persist
      if (currentUser && !isDemoMode) {
        const uid = currentUser.uid;
        await saveUserProfile(uid, updatedProf);
        await saveResumeAnalysisToFirestore(uid, extracted, insights);
        await saveSkillGapToFirestore(uid, gap);
        await saveFullRoadmapToFirestore(uid, rdmap, updatedProf.careerGoal);
        await saveCareerReadinessToFirestore(uid, score);
        if (recs.projects) await syncProjectsToFirestore(uid, recs.projects);
        await saveRecommendationsToFirestore(uid, recs.courses || [], recs.projects || [], recs.certifications || []);
        await saveInterviewPrepToFirestore(uid, iprep);
      }
    } catch (e) {
      console.error('Error processing uploaded resume:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        skillGap,
        roadmap,
        courses,
        projects,
        certifications,
        interviewPrep,
        readinessScore,
        resumeInsights,
        activeTab,
        setActiveTab,
        isAnalyzing,
        updateProfile,
        updateTaskStatus,
        addSkill,
        removeSkill,
        handleResumeUpload,
        reanalyzeAndRefresh,
        loadDemoModeData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
