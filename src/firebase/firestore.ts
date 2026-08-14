import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { app, configData } from './config';

export const db = getFirestore(app, configData.firestoreDatabaseId || undefined);

// Enable offline persistence for network resilience
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch(err => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn('Firestore persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the features required to enable persistence
      console.warn('Firestore persistence is not supported in this browser');
    }
  });
}

export default db;
