import { app } from './firebase/config';
import { auth } from './firebase/auth';
import { db } from './firebase/firestore';
import { storage } from './firebase/storage';

export { auth, db, storage };
export default app;
