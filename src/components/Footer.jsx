'use client';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from './Logo';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer style={{ borderTop: '1px solid var(--glass-border)', padding: '4rem 1.5rem', marginTop: '4rem' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', textAlign: 'center' }}>
        <Logo />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 600 }}>{t?.hero?.subtitle}</p>
        <div style={{ width: '100%', height: '1px', background: 'var(--glass-border)' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>© {new Date().getFullYear()} Yunus Emre DEMİRTAŞ. {t?.footer?.rights}</p>
      </div>
    </footer>
  );
}
