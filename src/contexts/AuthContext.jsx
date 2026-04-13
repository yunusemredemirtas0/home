'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import pb from '../lib/pocketbase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const user = pb.authStore.model;
    setCurrentUser(user);
    setIsAdmin(user?.email === 'yunusemredemirtas.dev@gmail.com' || user?.role === 'admin');
    setLoading(false);
    const removeListener = pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
      setIsAdmin(model?.email === 'yunusemredemirtas.dev@gmail.com' || model?.role === 'admin');
    });
    return () => removeListener();
  }, []);
  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
    setIsAdmin(false);
  };
  return (
    <AuthContext.Provider value={{ currentUser, isAdmin, logout, loading, pb }}>
      {mounted ? children : null}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
