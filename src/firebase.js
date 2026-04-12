import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy-key-for-build",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy-domain.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dummy-bucket.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123:web:123",
};

// Initialize Firebase safely for SSR (Next.js server-side)
let app;
const isBrowser = typeof window !== "undefined";

if (isBrowser) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  } catch (e) {
    console.error("Firebase init failed:", e);
  }
}

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

export default app;
