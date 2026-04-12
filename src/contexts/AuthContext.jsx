'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { initFirebase } from '../firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [firebase, setFirebase] = useState({ auth: null, db: null });

  useEffect(() => {
    setMounted(true);
    
    // Lazy load Firebase SDKs only in the browser
    const setup = async () => {
      const fb = await initFirebase();
      if (!fb) {
        setLoading(false);
        return;
      }
      
      const { auth, db } = fb;
      setFirebase({ auth, db });

      const { onAuthStateChanged } = await import('firebase/auth');
      const { doc, getDoc } = await import('firebase/firestore');

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        
        if (user && db) {
          try {
            const userDocRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(userDocRef);
            setIsAdmin(docSnap.exists() && docSnap.data().role === 'admin');
          } catch (e) {
            console.error("Auth role fetch error:", e);
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      });

      return unsubscribe;
    };

    let unsub;
    setup().then(u => { unsub = u; });

    return () => { if (unsub) unsub(); };
  }, []);

  const logout = async () => {
    if (firebase.auth) {
      const { signOut } = await import('firebase/auth');
      await signOut(firebase.auth);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAdmin, logout, loading, auth: firebase.auth, db: firebase.db }}>
      {mounted ? children : null}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
