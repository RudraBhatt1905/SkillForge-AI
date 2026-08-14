import { collection, doc, setDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { CourseRecommendation, ProjectRecommendation, CertificationRecommendation } from '../types';

export interface FirestoreRecommendationDoc {
  type: 'course' | 'project' | 'certification' | 'interview';
  title: string;
  provider: string;
  description: string;
  skills: string[];
  difficulty: string;
  estimatedTime: string;
  url: string;
  reason: string;
  priority: string;
  createdAt: string;
}

export const saveRecommendationsToFirestore = async (
  uid: string,
  courses: CourseRecommendation[],
  projects: ProjectRecommendation[],
  certifications: CertificationRecommendation[]
): Promise<void> => {
  if (!uid || uid.startsWith('demo_')) return;

  try {
    const now = new Date().toISOString();

    for (const c of courses) {
      const docRef = doc(db, 'users', uid, 'recommendations', c.id || `course_${Date.now()}`);
      const payload: FirestoreRecommendationDoc = {
        type: 'course',
        title: c.courseName,
        provider: c.provider,
        description: c.whyRecommended,
        skills: [c.skillCovered],
        difficulty: c.difficulty,
        estimatedTime: c.estimatedDuration,
        url: c.url,
        reason: c.whyRecommended,
        priority: 'High',
        createdAt: now,
      };
      await setDoc(docRef, payload, { merge: true });
    }

    for (const p of projects) {
      const docRef = doc(db, 'users', uid, 'recommendations', p.id || `project_${Date.now()}`);
      const payload: FirestoreRecommendationDoc = {
        type: 'project',
        title: p.projectTitle,
        provider: 'SkillForge Projects',
        description: p.description,
        skills: p.skillsLearned || [],
        difficulty: p.difficulty,
        estimatedTime: p.estimatedTime,
        url: '',
        reason: p.architectureOverview,
        priority: 'High',
        createdAt: now,
      };
      await setDoc(docRef, payload, { merge: true });
    }

    for (const cert of certifications) {
      const docRef = doc(db, 'users', uid, 'recommendations', cert.id || `cert_${Date.now()}`);
      const payload: FirestoreRecommendationDoc = {
        type: 'certification',
        title: cert.title,
        provider: cert.provider,
        description: cert.relevanceReason,
        skills: [],
        difficulty: cert.level,
        estimatedTime: cert.estimatedCost,
        url: cert.officialUrl,
        reason: cert.relevanceReason,
        priority: 'Medium',
        createdAt: now,
      };
      await setDoc(docRef, payload, { merge: true });
    }
  } catch (err) {
    console.error('Error saving recommendations to Firestore:', err);
  }
};

export const getRecommendationsFromFirestore = async (
  uid: string
): Promise<{
  courses: CourseRecommendation[];
  projects: ProjectRecommendation[];
  certifications: CertificationRecommendation[];
}> => {
  if (!uid || uid.startsWith('demo_')) return { courses: [], projects: [], certifications: [] };

  try {
    const ref = collection(db, 'users', uid, 'recommendations');
    const snap = await getDocs(ref);

    const courses: CourseRecommendation[] = [];
    const projects: ProjectRecommendation[] = [];
    const certifications: CertificationRecommendation[] = [];

    snap.docs.forEach(d => {
      const data = d.data() as FirestoreRecommendationDoc;
      if (data.type === 'course') {
        courses.push({
          id: d.id,
          courseName: data.title,
          provider: data.provider,
          skillCovered: data.skills?.[0] || 'Web Development',
          difficulty: (data.difficulty as any) || 'Intermediate',
          estimatedDuration: data.estimatedTime,
          whyRecommended: data.reason,
          url: data.url,
        });
      } else if (data.type === 'project') {
        projects.push({
          id: d.id,
          projectTitle: data.title,
          description: data.description,
          skillsLearned: data.skills || [],
          difficulty: (data.difficulty as any) || 'Intermediate',
          estimatedTime: data.estimatedTime,
          technologies: data.skills || [],
          architectureOverview: data.reason,
          readinessBoostPercentage: 10,
        });
      } else if (data.type === 'certification') {
        certifications.push({
          id: d.id,
          title: data.title,
          provider: data.provider,
          level: data.difficulty,
          relevanceReason: data.reason,
          estimatedCost: data.estimatedTime,
          officialUrl: data.url,
        });
      }
    });

    return { courses, projects, certifications };
  } catch (err) {
    console.error('Error fetching recommendations:', err);
    return { courses: [], projects: [], certifications: [] };
  }
};
