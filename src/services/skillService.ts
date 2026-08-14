import { collection, doc, setDoc, deleteDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firestore';

export interface FirestoreSkillDoc {
  name: string;
  category: string;
  currentLevel: 'None' | 'Beginner' | 'Intermediate' | 'Advanced';
  targetLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  skillGap: string;
  priority: 'High' | 'Medium' | 'Low';
  source: 'manual' | 'resume' | 'ai';
  createdAt?: string;
  updatedAt?: string;
}

export const getSkillsCollection = async (uid: string): Promise<FirestoreSkillDoc[]> => {
  if (!uid || uid.startsWith('demo_')) return [];
  try {
    const skillsRef = collection(db, 'users', uid, 'skills');
    const snap = await getDocs(skillsRef);
    return snap.docs.map(d => d.data() as FirestoreSkillDoc);
  } catch (err) {
    console.error('Error fetching skills:', err);
    return [];
  }
};

export const saveSkillToFirestore = async (
  uid: string,
  skillName: string,
  skillData: Partial<FirestoreSkillDoc>
): Promise<void> => {
  if (!uid || uid.startsWith('demo_')) return;
  const skillId = skillName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const skillRef = doc(db, 'users', uid, 'skills', skillId);
  
  const payload: FirestoreSkillDoc = {
    name: skillName,
    category: skillData.category || 'Technical',
    currentLevel: skillData.currentLevel || 'Beginner',
    targetLevel: skillData.targetLevel || 'Intermediate',
    skillGap: skillData.skillGap || 'Standard Gap',
    priority: skillData.priority || 'Medium',
    source: skillData.source || 'manual',
    updatedAt: new Date().toISOString(),
  };

  await setDoc(skillRef, payload, { merge: true });
};

export const deleteSkillFromFirestore = async (uid: string, skillName: string): Promise<void> => {
  if (!uid || uid.startsWith('demo_')) return;
  const skillId = skillName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const skillRef = doc(db, 'users', uid, 'skills', skillId);
  await deleteDoc(skillRef);
};

export const syncSkillsCollection = async (
  uid: string,
  skillNames: string[],
  source: 'manual' | 'resume' | 'ai' = 'manual'
): Promise<void> => {
  if (!uid || uid.startsWith('demo_')) return;
  for (const name of skillNames) {
    await saveSkillToFirestore(uid, name, { source });
  }
};

export const subscribeSkillsCollection = (
  uid: string,
  onUpdate: (skills: FirestoreSkillDoc[]) => void
) => {
  if (!uid || uid.startsWith('demo_')) return () => {};
  const skillsRef = collection(db, 'users', uid, 'skills');
  return onSnapshot(skillsRef, snap => {
    const skills = snap.docs.map(d => d.data() as FirestoreSkillDoc);
    onUpdate(skills);
  });
};
