import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function parseServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!raw) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_JSON environment variable.');
  }

  const parsed = JSON.parse(raw);

  if (typeof parsed.private_key === 'string') {
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
  }

  return parsed;
}

export function getAdminDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert(parseServiceAccount())
    });
  }

  return getFirestore();
}

export function getBlackboardPath() {
  return {
    collection: process.env.FIRESTORE_BLACKBOARD_COLLECTION || 'current_crisis_state',
    document: process.env.FIRESTORE_BLACKBOARD_DOC || process.env.NEXT_PUBLIC_FIRESTORE_BLACKBOARD_DOC || 'active'
  };
}
