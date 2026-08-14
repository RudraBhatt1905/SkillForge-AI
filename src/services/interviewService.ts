import { collection, doc, setDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { InterviewPrepPlan, InterviewTopic } from '../types';

export interface FirestoreInterviewQuestionDoc {
  question: string;
  category: string;
  difficulty: string;
  answer: string;
  userAnswer: string;
  score: number;
  completed: boolean;
  createdAt: string;
}

export const saveInterviewPrepToFirestore = async (
  uid: string,
  plan: InterviewPrepPlan
): Promise<void> => {
  if (!uid || uid.startsWith('demo_')) return;

  try {
    const allQuestions: InterviewTopic[] = [
      ...(plan.technicalQuestions || []),
      ...(plan.hrQuestions || []),
    ];

    const now = new Date().toISOString();

    for (const q of allQuestions) {
      const qRef = doc(db, 'users', uid, 'interviewPrep', q.id || `q_${Date.now()}`);
      const payload: FirestoreInterviewQuestionDoc = {
        question: q.question,
        category: q.category || 'Technical',
        difficulty: q.difficulty || 'Medium',
        answer: q.aiSuggestedAnswer || '',
        userAnswer: '',
        score: q.mastered ? 100 : 0,
        completed: Boolean(q.mastered),
        createdAt: now,
      };
      await setDoc(qRef, payload, { merge: true });
    }
  } catch (err) {
    console.error('Error saving interview prep to Firestore:', err);
  }
};

export const updateInterviewQuestionMastery = async (
  uid: string,
  questionId: string,
  mastered: boolean
): Promise<void> => {
  if (!uid || uid.startsWith('demo_')) return;

  try {
    const qRef = doc(db, 'users', uid, 'interviewPrep', questionId);
    await setDoc(
      qRef,
      {
        completed: mastered,
        score: mastered ? 100 : 0,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Error updating interview question status:', err);
  }
};

export const subscribeInterviewPrep = (
  uid: string,
  onUpdate: (questionsMap: Map<string, boolean>) => void
) => {
  if (!uid || uid.startsWith('demo_')) return () => {};

  const ref = collection(db, 'users', uid, 'interviewPrep');
  return onSnapshot(ref, snap => {
    const map = new Map<string, boolean>();
    snap.docs.forEach(d => {
      const data = d.data() as FirestoreInterviewQuestionDoc;
      map.set(d.id, Boolean(data.completed));
    });
    onUpdate(map);
  });
};
