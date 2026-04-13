'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../data/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('tr');
  useEffect(() => {
    const saved = localStorage.getItem('site_lang');
    if (saved) setLanguage(saved);
  }, []);
  const toggleLanguage = () => {
    const next = language === 'tr' ? 'en' : 'tr';
    setLanguage(next);
    localStorage.setItem('site_lang', next);
  };
  const t = translations[language];
  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
