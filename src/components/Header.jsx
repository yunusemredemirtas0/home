'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

export default function Header() {
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: t?.nav?.home, href: '/' },
    { label: t?.nav?.about, href: '/#about' },
    { label: t?.nav?.services, href: '/#services' },
    { label: t?.nav?.projects, href: '/projects' },
    { label: t?.nav?.blog, href: '/blog' },
    { label: t?.nav?.contact, href: '/#contact' },
  ];

  return (
    <header
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, height: 'var(--nav-height)',
        transition: 'background 0.3s, border-color 0.3s',
        ...(scrolled
          ? { background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid var(--glass-border)' }
          : { background: 'transparent', borderBottom: '1px solid transparent' }),
      }}
    >
      <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
        <Logo />
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.92rem', fontWeight: 500,
                color: 'var(--text-secondary)', background: 'transparent', transition: 'color var(--transition)'
              }}
            >{link.label}</Link>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={toggleLanguage} style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{language === 'tr' ? 'EN' : 'TR'}</button>
          <button onClick={toggleTheme} style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', fontSize: '1.1rem' }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
          {currentUser ? (
            <Link href="/dashboard" className="glass" style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{currentUser.name?.[0]?.toUpperCase() || 'U'}</Link>
          ) : (
            <Link href="/login" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>{t?.nav?.login}</Link>
          )}
        </div>
      </div>
    </header>
  );
}
