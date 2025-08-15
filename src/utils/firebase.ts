// Firebase initialization and exports
// Uses the config provided by the user.

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported as analyticsSupported, Analytics } from 'firebase/analytics';
import { getAuth, signInAnonymously, onAuthStateChanged, Auth, User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBy4bvZH8_YbvFNkGethplg43ywNK7rQbE",
  authDomain: "property-dealer-fa114.firebaseapp.com",
  projectId: "property-dealer-fa114",
  storageBucket: "property-dealer-fa114.firebasestorage.app",
  messagingSenderId: "92562167671",
  appId: "1:92562167671:web:05cc0457f7511233dbf372",
  measurementId: "G-F02W8547XL"
};

let app: FirebaseApp;
let analytics: Analytics | null = null;
let auth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0]!;
  }
  return app;
}

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  try {
    if (typeof window !== 'undefined' && (await analyticsSupported())) {
      if (!analytics) {
        analytics = getAnalytics(getFirebaseApp());
      }
      return analytics;
    }
  } catch (_) {
    // ignore analytics failures in unsupported environments
  }
  return null;
}

export async function ensureAnonymousAuth(): Promise<User | null> {
  try {
    const app = getFirebaseApp();
    if (!auth) auth = getAuth(app);
    return await new Promise<User | null>((resolve) => {
      const unsub = onAuthStateChanged(auth!, async (user) => {
        if (user) {
          unsub();
          resolve(user);
        } else {
          try {
            const res = await signInAnonymously(auth!);
            unsub();
            resolve(res.user);
          } catch (e) {
            console.warn('Anonymous auth failed:', e);
            unsub();
            resolve(null);
          }
        }
      });
    });
  } catch (e) {
    console.warn('Auth init failed:', e);
    return null;
  }
}
