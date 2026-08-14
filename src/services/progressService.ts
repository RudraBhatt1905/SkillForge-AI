import { collection, doc, setDoc, getDocs, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/firestore';

export interface FirestoreProgressDoc {
  date: string;
  learningHours: number;
  tasksCompleted: number;
  skillsImproved: number;
  projectsCompleted: number;
  xpEarned: number;
  createdAt?: string;
}

export const logDailyProgressInFirestore = async (
  uid: string,
  entry: FirestoreProgressDoc
): Promise<void> => {
  if (!uid || uid.startsWith('demo_')) return;

  try {
    const dateKey = entry.date || new Date().toISOString().split('T')[0];
    const ref = doc(db, 'users', uid, 'progress', dateKey);
    const payload: FirestoreProgressDoc = {
      date: dateKey,
      learningHours: entry.learningHours || 1.5,
      tasksCompleted: entry.tasksCompleted || 1,
      skillsImproved: entry.skillsImproved || 1,
      projectsCompleted: entry.projectsCompleted || 0,
      xpEarned: entry.xpEarned || 50,
      createdAt: new Date().toISOString(),
    };
    await setDoc(ref, payload, { merge: true });
  } catch (err) {
    console.error('Error logging progress to Firestore:', err);
  }
};

export const getProgressHistoryFromFirestore = async (uid: string): Promise<FirestoreProgressDoc[]> => {
  if (!uid || uid.startsWith('demo_')) return [];

  try {
    const ref = collection(db, 'users', uid, 'progress');
    const q = query(ref, orderBy('date', 'desc'), limit(30));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as FirestoreProgressDoc);
  } catch (err) {
    console.error('Error fetching progress history:', err);
    return [];
  }
};

export const subscribeProgressHistory = (
  uid: string,
  onUpdate: (history: FirestoreProgressDoc[]) => void
) => {
  if (!uid || uid.startsWith('demo_')) return () => {};

  const ref = collection(db, 'users', uid, 'progress');
  return onSnapshot(ref, snap => {
    const history = snap.docs.map(d => d.data() as FirestoreProgressDoc);
    onUpdate(history);
  });
};
