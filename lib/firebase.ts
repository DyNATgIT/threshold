import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

export function hasFirebaseConfig(): boolean {
  return Object.values(firebaseConfig).every(Boolean);
}

export function getClientFirebaseApp(): FirebaseApp {
  if (!hasFirebaseConfig()) {
    throw new Error('Firebase config is incomplete. Check your environment variables.');
  }

  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}
