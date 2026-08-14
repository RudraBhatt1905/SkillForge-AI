# SkillForge AI — Firebase Integration & Setup Guide

This document provides a step-by-step guide for setting up Firebase Authentication, Firestore Database, and Firebase Storage for **SkillForge AI**.

---

## 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and name your project (e.g., `skillforge-ai-2026`).
3. Enable or disable Google Analytics according to your preference and click **Create Project**.

---

## 2. Enable Firebase Authentication
1. In the Firebase Console side menu, navigate to **Build > Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, select **Email/Password**.
4. Enable **Email/Password** and click **Save**.

---

## 3. Create Firestore Database
1. Navigate to **Build > Firestore Database**.
2. Click **Create Database**.
3. Choose your database location (e.g., `nam5 (us-central)` or `asia-south1`).
4. Select **Start in Production Mode** (we will configure security rules next).
5. Click **Create**.

---

## 4. Enable Firebase Storage
1. Navigate to **Build > Storage**.
2. Click **Get Started**.
3. Select **Start in Production Mode**.
4. Choose the storage location and click **Done**.

---

## 5. Add Web App & Copy Configuration
1. In your Firebase Project Overview, click the **Web icon (`</>`)** to add a web app.
2. Enter App Nickname (e.g., `SkillForge Web`).
3. Click **Register App**.
4. Copy the `firebaseConfig` object values (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`).

---

## 6. Configure Environment Variables
Copy `.env.example` to `.env` or set environment variables in your environment:

```env
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"
VITE_FIREBASE_APP_ID="1:1234567890:web:abcdef123456"
```

Alternatively, `SkillForge AI` automatically reads from `firebase-applet-config.json` in the root workspace directory if environment variables are not provided.

---

## 7. Deploy Firestore Security Rules
Go to **Firestore Database > Rules** in the Firebase Console and paste the following security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write only their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /{allSubcollections=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    match /public_resources/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Click **Publish**.

---

## 8. Deploy Storage Security Rules
Go to **Storage > Rules** in the Firebase Console and paste:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /resumes/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Click **Publish**.

---

## 9. Firestore Schema Architecture Summary
- `users/{uid}`: Primary student profile document
- `users/{uid}/skills/{skillId}`: Skill catalog entries
- `users/{uid}/projects/{projectId}`: Custom and assigned projects
- `users/{uid}/roadmaps/{roadmapId}`: Roadmap parent document
- `users/{uid}/roadmaps/{roadmapId}/tasks/{taskId}`: Individual learning tasks & completion status
- `users/{uid}/recommendations/{recommendationId}`: Personalized course & project suggestions
- `users/{uid}/certifications/{certificationId}`: Certifications tracking
- `users/{uid}/interviewPrep/{questionId}`: Interview questions & mastery state
- `users/{uid}/progress/{progressId}`: Daily learning analytics & XP earned
- `users/{uid}/resumeAnalysis/current`: Persistent structured Gemini resume extraction
- `users/{uid}/skillGap/current`: Persistent Gemini skill gap analysis
- `users/{uid}/careerReadiness/current`: Cached career readiness scores

---

## 10. Verification Checklist
- [x] Email/password Sign Up and Login verified
- [x] Persistent session state via Auth listener
- [x] Resume upload to Firebase Storage and metadata saved in Firestore
- [x] Real-time task completion updates and XP gamification
- [x] AI Career Mentor context-aware responses using Firestore profile
- [x] Judge Demo Mode accessible without account creation
