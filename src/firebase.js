// Firebase Configuration ONLY
// No top-level SDK imports to prevent Cloudflare Edge Runtime crashes
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy-key-for-build",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy-domain.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dummy-bucket.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123:web:123",
};

// We will export a lazy initializer for the client
export const initFirebase = async () => {
  if (typeof window === "undefined") return null;

  const { initializeApp, getApps, getApp } = await import("firebase/app");
  const { getAuth } = await import("firebase/auth");
  const { getFirestore } = await import("firebase/firestore");

  try {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    return { app, auth, db };
  } catch (e) {
    console.error("Lazy Firebase init failed:", e);
    return null;
  }
};
