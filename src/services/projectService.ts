import { collection, doc, setDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { ProjectRecommendation } from '../types';

export interface FirestoreProjectDoc {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  skills: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  status: 'not_started' | 'in_progress' | 'completed';
  githubUrl?: string;
  liveUrl?: string;
  createdAt: string;
}

export const getProjectsFromFirestore = async (uid: string): Promise<ProjectRecommendation[]> => {
  if (!uid || uid.startsWith('demo_')) return [];
  try {
    const projRef = collection(db, 'users', uid, 'projects');
    const snap = await getDocs(projRef);
    return snap.docs.map(d => {
      const data = d.data() as FirestoreProjectDoc;
      return {
        id: data.id || d.id,
        projectTitle: data.title,
        description: data.description,
        skillsLearned: data.skills || [],
        difficulty: data.difficulty || 'Intermediate',
        estimatedTime: data.estimatedTime || '10 Hours',
        technologies: data.technologies || [],
        architectureOverview: data.description,
        readinessBoostPercentage: 10,
        isCompleted: data.status === 'completed',
      };
    });
  } catch (err) {
    console.error('Error in getProjectsFromFirestore:', err);
    return [];
  }
};

export const syncProjectsToFirestore = async (
  uid: string,
  projects: ProjectRecommendation[]
): Promise<void> => {
  if (!uid || uid.startsWith('demo_')) return;
  for (const p of projects) {
    const projRef = doc(db, 'users', uid, 'projects', p.id);
    const docData: FirestoreProjectDoc = {
      id: p.id,
      title: p.projectTitle,
      description: p.description,
      technologies: p.technologies || [],
      skills: p.skillsLearned || [],
      difficulty: p.difficulty || 'Intermediate',
      estimatedTime: p.estimatedTime || '10-15 Hours',
      status: p.isCompleted ? 'completed' : 'in_progress',
      createdAt: new Date().toISOString(),
    };
    await setDoc(projRef, docData, { merge: true });
  }
};

export const subscribeProjects = (
  uid: string,
  onUpdate: (projects: ProjectRecommendation[]) => void
) => {
  if (!uid || uid.startsWith('demo_')) return () => {};
  const projRef = collection(db, 'users', uid, 'projects');
  return onSnapshot(projRef, snap => {
    const list = snap.docs.map(d => {
      const data = d.data() as FirestoreProjectDoc;
      return {
        id: data.id || d.id,
        projectTitle: data.title || 'Project',
        description: data.description || '',
        skillsLearned: data.skills || [],
        difficulty: data.difficulty || 'Intermediate',
        estimatedTime: data.estimatedTime || '10 Hours',
        technologies: data.technologies || [],
        architectureOverview: data.description || '',
        readinessBoostPercentage: 10,
        isCompleted: data.status === 'completed',
      };
    });
    onUpdate(list);
  });
};
