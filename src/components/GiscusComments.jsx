'use client';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function GiscusComments({ repoId, categoryId }) {
  const { language } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !repoId || !categoryId || !containerRef.current) return;

    // Clear previous script if any
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'yunusemredemirtas0/home');
    script.setAttribute('data-repo-id', repoId);
    script.setAttribute('data-category', 'Announcements');
    script.setAttribute('data-category-id', categoryId);
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'dark_dimmed');
    script.setAttribute('data-lang', language === 'tr' ? 'tr' : 'en');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    containerRef.current.appendChild(script);
  }, [isMounted, repoId, categoryId, language]);

  return (
    <div style={{ marginTop: '5rem', minHeight: '300px' }}>
      {!repoId || !categoryId ? (
        <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Yorum Sistemi Yapılandırılıyor...</p>
            <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>RepoID ve CategoryID bekleniyor.</p>
        </div>
      ) : (
        <div ref={containerRef} id="giscus-container" />
      )}
    </div>
  );
}
