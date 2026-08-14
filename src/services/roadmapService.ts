import { collection, doc, setDoc, getDocs, onSnapshot, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { RoadmapPhase, RoadmapTask, TaskStatus } from '../types';

export interface FirestoreRoadmapDoc {
  title: string;
  careerGoal: string;
  description: string;
  totalDuration: string;
  overallProgress: number;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreTaskDoc {
  id: string;
  title: string;
  description: string;
  skill: string;
  phase: number;
  phaseName: string;
  week: string;
  difficulty: string;
  resources: any[];
  estimatedHours: string;
  status: TaskStatus;
  completedAt?: string;
  updatedAt: string;
}

export const MAIN_ROADMAP_ID = 'current_roadmap';

export const saveFullRoadmapToFirestore = async (
  uid: string,
  phases: RoadmapPhase[],
  careerGoal: string
): Promise<void> => {
  if (!uid || uid.startsWith('demo_')) return;

  try {
    let totalTasks = 0;
    let completedTasks = 0;

    phases.forEach(p => {
      p.tasks.forEach(t => {
        totalTasks++;
        if (t.status === 'completed') completedTasks++;
      });
    });

    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const roadmapRef = doc(db, 'users', uid, 'roadmaps', MAIN_ROADMAP_ID);

    const roadmapDoc: FirestoreRoadmapDoc = {
      title: `${careerGoal} Mastery Roadmap`,
      careerGoal,
      description: `Personalized step-by-step career milestones for ${careerGoal}`,
      totalDuration: `${phases.length * 2} Weeks`,
      overallProgress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(roadmapRef, roadmapDoc, { merge: true });

    // Save tasks to subcollection `users/{uid}/roadmaps/{roadmapId}/tasks/{taskId}`
    for (const phase of phases) {
      for (const task of phase.tasks) {
        const taskRef = doc(db, 'users', uid, 'roadmaps', MAIN_ROADMAP_ID, 'tasks', task.id);
        const taskDocData: FirestoreTaskDoc = {
          id: task.id,
          title: task.title,
          description: task.learningObjective || '',
          skill: task.skill || '',
          phase: task.phase || phase.phaseNumber,
          phaseName: task.phaseName || phase.title,
          week: task.estimatedDuration || '1 Week',
          difficulty: task.difficulty || 'Intermediate',
          resources: task.resources || [],
          estimatedHours: task.estimatedDuration || '5 Hours',
          status: task.status || 'not_started',
          completedAt: task.completedAt || undefined,
          updatedAt: new Date().toISOString(),
        };
        await setDoc(taskRef, taskDocData, { merge: true });
      }
    }
  } catch (err) {
    console.error('Error saving roadmap to Firestore:', err);
    throw new Error('Unable to save personalized roadmap to cloud storage.');
  }
};

export const updateRoadmapTaskStatusInFirestore = async (
  uid: string,
  taskId: string,
  status: TaskStatus,
  roadmapPhases: RoadmapPhase[]
): Promise<void> => {
  if (!uid || uid.startsWith('demo_')) return;

  try {
    const taskRef = doc(db, 'users', uid, 'roadmaps', MAIN_ROADMAP_ID, 'tasks', taskId);
    const now = new Date().toISOString();
    
    await setDoc(
      taskRef,
      {
        status,
        completedAt: status === 'completed' ? now.split('T')[0] : null,
        updatedAt: now,
      },
      { merge: true }
    );

    // Recalculate overall progress
    let totalTasks = 0;
    let completedTasks = 0;

    roadmapPhases.forEach(p => {
      p.tasks.forEach(t => {
        totalTasks++;
        const currentStatus = t.id === taskId ? status : t.status;
        if (currentStatus === 'completed') completedTasks++;
      });
    });

    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const roadmapRef = doc(db, 'users', uid, 'roadmaps', MAIN_ROADMAP_ID);
    await setDoc(roadmapRef, { overallProgress, updatedAt: now }, { merge: true });
  } catch (err) {
    console.error('Error updating task status in Firestore:', err);
    throw new Error('Unable to update task status in cloud storage.');
  }
};

export const getRoadmapFromFirestore = async (
  uid: string,
  fallbackPhases: RoadmapPhase[]
): Promise<RoadmapPhase[]> => {
  if (!uid || uid.startsWith('demo_')) return fallbackPhases;

  try {
    const tasksRef = collection(db, 'users', uid, 'roadmaps', MAIN_ROADMAP_ID, 'tasks');
    const snap = await getDocs(tasksRef);
    if (snap.empty) return fallbackPhases;

    const taskDocsMap = new Map<string, FirestoreTaskDoc>();
    snap.docs.forEach(d => {
      const data = d.data() as FirestoreTaskDoc;
      taskDocsMap.set(data.id || d.id, data);
    });

    // Merge status into fallback structure or rebuild
    const updatedPhases = fallbackPhases.map(phase => ({
      ...phase,
      tasks: phase.tasks.map(t => {
        const stored = taskDocsMap.get(t.id);
        if (stored) {
          return {
            ...t,
            status: stored.status,
            completedAt: stored.completedAt || undefined,
          };
        }
        return t;
      }),
    }));

    return updatedPhases;
  } catch (err) {
    console.error('Error fetching roadmap from Firestore:', err);
    return fallbackPhases;
  }
};

export const subscribeRoadmap = (
  uid: string,
  fallbackPhases: RoadmapPhase[],
  onUpdate: (phases: RoadmapPhase[]) => void
) => {
  if (!uid || uid.startsWith('demo_')) return () => {};

  const tasksRef = collection(db, 'users', uid, 'roadmaps', MAIN_ROADMAP_ID, 'tasks');
  return onSnapshot(tasksRef, snap => {
    if (snap.empty) return;
    const taskDocsMap = new Map<string, FirestoreTaskDoc>();
    snap.docs.forEach(d => {
      const data = d.data() as FirestoreTaskDoc;
      taskDocsMap.set(data.id || d.id, data);
    });

    const updatedPhases = fallbackPhases.map(phase => ({
      ...phase,
      tasks: phase.tasks.map(t => {
        const stored = taskDocsMap.get(t.id);
        if (stored) {
          return {
            ...t,
            status: stored.status,
            completedAt: stored.completedAt || undefined,
          };
        }
        return t;
      }),
    }));

    onUpdate(updatedPhases);
  });
};
