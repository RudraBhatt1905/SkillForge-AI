import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { CareerReadinessScore, SkillGapAnalysis } from '../types';

export interface FirestoreCareerReadinessDoc {
  score: number;
  skillScore: number;
  projectScore: number;
  resumeScore: number;
  certificationScore: number;
  interviewScore: number;
  roadmapScore: number;
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  updatedAt: string;
}

export interface FirestoreSkillGapDoc {
  targetRole: string;
  currentSkills: string[];
  missingSkills: string[];
  weakSkills: string[];
  prioritySkills: {
    skill: string;
    currentLevel: string;
    requiredLevel: string;
    gap: string;
    priority: string;
    explanation: string;
  }[];
  recommendations?: string[];
  generatedAt: string;
}

export const saveCareerReadinessToFirestore = async (
  uid: string,
  readinessScore: CareerReadinessScore
): Promise<void> => {
  if (!uid || uid.startsWith('demo_')) return;

  try {
    const docRef = doc(db, 'users', uid, 'careerReadiness', 'current');
    const payload: FirestoreCareerReadinessDoc = {
      score: readinessScore.overallScore || 0,
      skillScore: readinessScore.breakdown?.skillCoverage || 0,
      projectScore: readinessScore.breakdown?.projectQuality || 0,
      resumeScore: readinessScore.breakdown?.resumeStrength || 0,
      certificationScore: readinessScore.breakdown?.interviewReadiness || 0,
      interviewScore: readinessScore.breakdown?.interviewReadiness || 0,
      roadmapScore: readinessScore.breakdown?.roadmapProgress || 0,
      strengths: readinessScore.positiveFactors || [],
      weaknesses: readinessScore.negativeFactors || [],
      improvementSuggestions: (readinessScore.boostActionPlan || []).map(a => a.action),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(docRef, payload, { merge: true });
  } catch (err) {
    console.error('Error saving career readiness score to Firestore:', err);
  }
};

export const getCareerReadinessFromFirestore = async (
  uid: string
): Promise<FirestoreCareerReadinessDoc | null> => {
  if (!uid || uid.startsWith('demo_')) return null;

  try {
    const docRef = doc(db, 'users', uid, 'careerReadiness', 'current');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as FirestoreCareerReadinessDoc;
    }
    return null;
  } catch (err) {
    console.error('Error getting career readiness score:', err);
    return null;
  }
};

export const saveSkillGapToFirestore = async (
  uid: string,
  skillGap: SkillGapAnalysis
): Promise<void> => {
  if (!uid || uid.startsWith('demo_')) return;

  try {
    const docRef = doc(db, 'users', uid, 'skillGap', 'current');
    const payload: FirestoreSkillGapDoc = {
      targetRole: skillGap.targetRole,
      currentSkills: skillGap.strongSkills || [],
      missingSkills: skillGap.missingSkills || [],
      weakSkills: skillGap.weakSkills || [],
      prioritySkills: (skillGap.prioritySkills || []).map(s => ({
        skill: s.skill,
        currentLevel: s.currentLevel,
        requiredLevel: s.requiredLevel,
        gap: s.gapSeverity,
        priority: s.priority,
        explanation: s.reason || s.recommendedAction,
      })),
      recommendations: (skillGap.prioritySkills || []).map(s => s.recommendedAction),
      generatedAt: new Date().toISOString(),
    };

    await setDoc(docRef, payload, { merge: true });
  } catch (err) {
    console.error('Error saving skill gap analysis to Firestore:', err);
  }
};

export const getSkillGapFromFirestore = async (
  uid: string
): Promise<FirestoreSkillGapDoc | null> => {
  if (!uid || uid.startsWith('demo_')) return null;

  try {
    const docRef = doc(db, 'users', uid, 'skillGap', 'current');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as FirestoreSkillDocGap;
    }
    return null;
  } catch (err) {
    console.error('Error getting skill gap from Firestore:', err);
    return null;
  }
};

type FirestoreSkillDocGap = FirestoreSkillGapDoc;
