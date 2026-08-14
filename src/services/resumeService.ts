import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { storage } from '../firebase/storage';
import { db } from '../firebase/firestore';
import { ExtractedResume, ResumeInsights } from '../types';

export interface FirestoreResumeAnalysisDoc {
  summary: string;
  technicalSkills: string[];
  frameworks: string[];
  databases: string[];
  tools: string[];
  softSkills: string[];
  projects: any[];
  education: any;
  experience: any[];
  inferredSkills: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  analyzedAt: string;
}

export const uploadResumeToStorage = async (
  uid: string,
  file: File
): Promise<{ downloadUrl: string; storagePath: string }> => {
  if (!uid || uid.startsWith('demo_')) {
    return { downloadUrl: '', storagePath: '' };
  }

  if (!file) {
    throw new Error('No resume file selected.');
  }

  // File size validation (Max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Resume file size exceeds the 5MB limit. Please upload a smaller PDF or document.');
  }

  const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const storagePath = `resumes/${uid}/${cleanFileName}`;
  const storageRef = ref(storage, storagePath);

  try {
    const uploadResult = await uploadBytes(storageRef, file, {
      contentType: file.type || 'application/pdf',
      customMetadata: { uid, fileName: file.name },
    });

    let downloadUrl = '';
    try {
      downloadUrl = await getDownloadURL(uploadResult.ref);
    } catch (e) {
      console.warn('Could not retrieve public download URL:', e);
    }

    // Save resume upload metadata document in Firestore
    const metadataRef = doc(db, 'users', uid, 'resumes', cleanFileName);
    await setDoc(metadataRef, {
      fileName: file.name,
      storagePath,
      downloadUrl,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      uid,
    });

    return { downloadUrl, storagePath };
  } catch (err) {
    console.error('Error uploading resume to Firebase Storage:', err);
    throw new Error('Failed to upload resume to cloud storage. Please check network connection.');
  }
};

export const saveResumeAnalysisToFirestore = async (
  uid: string,
  extracted: ExtractedResume,
  insights: ResumeInsights
): Promise<void> => {
  if (!uid || uid.startsWith('demo_')) return;

  try {
    const docRef = doc(db, 'users', uid, 'resumeAnalysis', 'current');
    const payload: FirestoreResumeAnalysisDoc = {
      summary: extracted.summary || '',
      technicalSkills: extracted.technicalSkills || [],
      frameworks: extracted.frameworks || [],
      databases: extracted.databases || [],
      tools: extracted.tools || [],
      softSkills: extracted.softSkills || [],
      projects: extracted.projects || [],
      education: extracted.education || {},
      experience: extracted.experience || [],
      inferredSkills: extracted.technicalSkills || [],
      strengths: insights.strengths || [],
      weaknesses: insights.weaknesses || [],
      suggestions: [
        ...(insights.formattingSuggestions || []),
        ...(insights.projectImprovementSuggestions || []),
      ],
      analyzedAt: new Date().toISOString(),
    };

    await setDoc(docRef, payload, { merge: true });
  } catch (err) {
    console.error('Error saving resume analysis to Firestore:', err);
    throw new Error('Unable to persist resume analysis in database.');
  }
};

export const getResumeAnalysisFromFirestore = async (
  uid: string
): Promise<FirestoreResumeAnalysisDoc | null> => {
  if (!uid || uid.startsWith('demo_')) return null;

  try {
    const docRef = doc(db, 'users', uid, 'resumeAnalysis', 'current');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as FirestoreResumeAnalysisDoc;
    }
    return null;
  } catch (err) {
    console.error('Error fetching resume analysis:', err);
    return null;
  }
};
