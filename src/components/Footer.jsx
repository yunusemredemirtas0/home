'use client';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from './Logo';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer style={{ borderTop: '1px solid var(--glass-border)', padding: '3rem 1.5rem', marginTop: '4rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center' }}>
        <Logo />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>© {new Date().getFullYear()} Yunus Emre DEMİRTAŞ. {t?.footer?.rights}</p>
      </div>
    </footer>
  );
}
