'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import pb from '../lib/pocketbase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setCurrentUser(pb.authStore.model);
    setLoading(false);
    const removeListener = pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
    });
    return () => removeListener();
  }, []);
  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
  };
  return (
    <AuthContext.Provider value={{ currentUser, logout, loading, pb }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
