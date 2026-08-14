import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { StudentProfile } from '../types';

export interface FirestoreUserProfile {
  uid: string;
  name: string;
  email: string;
  college: string;
  branch: string;
  year: string;
  location: string;
  careerGoal: string;
  experienceLevel: string;
  interests: string[];
  createdAt: string;
  updatedAt: string;
  xp?: number;
  level?: number;
  levelTitle?: string;
  streakDays?: number;
  lastActiveDate?: string;
  badges?: any[];
  currentSkills?: string[];
  degree?: string;
  isOnboarded?: boolean;
}

export const validateUserProfile = (profile: Partial<StudentProfile>): string | null => {
  if (profile.name !== undefined && profile.name.trim() === '') {
    return 'Name cannot be empty.';
  }
  if (profile.careerGoal !== undefined && profile.careerGoal.trim() === '') {
    return 'Career goal cannot be empty.';
  }
  return null;
};

export const getUserProfile = async (uid: string): Promise<StudentProfile | null> => {
  if (!uid || uid.startsWith('demo_')) return null;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        uid: data.uid || uid,
        name: data.name || '',
        email: data.email || '',
        college: data.college || '',
        degree: data.degree || 'B.Tech',
        branch: data.branch || '',
        yearOfStudy: data.year || data.yearOfStudy || '2nd Year',
        location: data.location || '',
        careerGoal: data.careerGoal || 'Full Stack Developer',
        currentSkills: Array.isArray(data.currentSkills) ? data.currentSkills : [],
        interests: Array.isArray(data.interests) ? data.interests : [],
        experienceLevel: data.experienceLevel || 'Beginner',
        xp: typeof data.xp === 'number' ? data.xp : 100,
        level: typeof data.level === 'number' ? data.level : 1,
        levelTitle: data.levelTitle || 'Lvl 1: Novice Explorer',
        streakDays: typeof data.streakDays === 'number' ? data.streakDays : 1,
        lastActiveDate: data.lastActiveDate || new Date().toISOString().split('T')[0],
        badges: Array.isArray(data.badges) ? data.badges : [],
        isOnboarded: Boolean(data.isOnboarded),
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
    }
    return null;
  } catch (err) {
    console.error('Error in getUserProfile:', err);
    throw new Error('Unable to retrieve user profile. Please check your network connection.');
  }
};

export const saveUserProfile = async (uid: string, profile: Partial<StudentProfile>): Promise<void> => {
  if (!uid || uid.startsWith('demo_')) return;
  const validationError = validateUserProfile(profile);
  if (validationError) {
    throw new Error(validationError);
  }

  try {
    const userRef = doc(db, 'users', uid);
    const now = new Date().toISOString();
    const firestoreData: Partial<FirestoreUserProfile> = {
      uid,
      updatedAt: now,
    };

    if (profile.name !== undefined) firestoreData.name = profile.name;
    if (profile.email !== undefined) firestoreData.email = profile.email;
    if (profile.college !== undefined) firestoreData.college = profile.college;
    if (profile.branch !== undefined) firestoreData.branch = profile.branch;
    if (profile.yearOfStudy !== undefined) firestoreData.year = profile.yearOfStudy;
    if (profile.location !== undefined) firestoreData.location = profile.location;
    if (profile.careerGoal !== undefined) firestoreData.careerGoal = profile.careerGoal;
    if (profile.experienceLevel !== undefined) firestoreData.experienceLevel = profile.experienceLevel;
    if (profile.interests !== undefined) firestoreData.interests = profile.interests;
    if (profile.currentSkills !== undefined) firestoreData.currentSkills = profile.currentSkills;
    if (profile.xp !== undefined) firestoreData.xp = profile.xp;
    if (profile.level !== undefined) firestoreData.level = profile.level;
    if (profile.levelTitle !== undefined) firestoreData.levelTitle = profile.levelTitle;
    if (profile.streakDays !== undefined) firestoreData.streakDays = profile.streakDays;
    if (profile.lastActiveDate !== undefined) firestoreData.lastActiveDate = profile.lastActiveDate;
    if (profile.badges !== undefined) firestoreData.badges = profile.badges;
    if (profile.isOnboarded !== undefined) firestoreData.isOnboarded = profile.isOnboarded;
    if (profile.degree !== undefined) firestoreData.degree = profile.degree;

    await setDoc(userRef, firestoreData, { merge: true });
  } catch (err) {
    console.error('Error in saveUserProfile:', err);
    throw new Error('Unable to save user profile. Please try again.');
  }
};

export const subscribeUserProfile = (
  uid: string,
  onUpdate: (profile: StudentProfile | null) => void,
  onError?: (err: Error) => void
) => {
  if (!uid || uid.startsWith('demo_')) return () => {};
  const userRef = doc(db, 'users', uid);
  return onSnapshot(
    userRef,
    snap => {
      if (snap.exists()) {
        const data = snap.data();
        onUpdate({
          uid: data.uid || uid,
          name: data.name || '',
          email: data.email || '',
          college: data.college || '',
          degree: data.degree || 'B.Tech',
          branch: data.branch || '',
          yearOfStudy: data.year || data.yearOfStudy || '2nd Year',
          location: data.location || '',
          careerGoal: data.careerGoal || 'Full Stack Developer',
          currentSkills: Array.isArray(data.currentSkills) ? data.currentSkills : [],
          interests: Array.isArray(data.interests) ? data.interests : [],
          experienceLevel: data.experienceLevel || 'Beginner',
          xp: typeof data.xp === 'number' ? data.xp : 100,
          level: typeof data.level === 'number' ? data.level : 1,
          levelTitle: data.levelTitle || 'Lvl 1: Novice Explorer',
          streakDays: typeof data.streakDays === 'number' ? data.streakDays : 1,
          lastActiveDate: data.lastActiveDate || new Date().toISOString().split('T')[0],
          badges: Array.isArray(data.badges) ? data.badges : [],
          isOnboarded: Boolean(data.isOnboarded),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      } else {
        onUpdate(null);
      }
    },
    err => {
      console.error('Snapshot error on user profile:', err);
      if (onError) onError(new Error('Real-time connection interrupted.'));
    }
  );
};
