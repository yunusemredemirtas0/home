'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

import { FiMenu, FiX } from 'react-icons/fi';

export default function Header() {
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }, [isMenuOpen]);

  const navLinks = [
    { label: t?.nav?.home, href: '/' },
    { label: t?.nav?.about, href: '/#about' },
    { label: t?.nav?.services, href: '/#services' },
    { label: t?.nav?.projects, href: '/projects' },
    { label: t?.nav?.blog, href: '/blog' },
    { label: t?.nav?.contact, href: '/#contact' },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, height: 'var(--nav-height)',
          transition: 'background 0.3s, border-color 0.3s',
          ...(scrolled
            ? { background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid var(--glass-border)' }
            : { background: 'transparent', borderBottom: '1px solid transparent' }),
        }}
      >
        <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <Logo />
          
          {/* Desktop Navigation */}
          <nav className="desktop-only" style={{ alignItems: 'center', gap: '0.25rem' }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.92rem', fontWeight: 500,
                  color: 'var(--text-secondary)', background: 'transparent', transition: 'color var(--transition)'
                }}
                className="hover-accent"
              >{link.label}</Link>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="desktop-only" style={{ alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={toggleLanguage} style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{language === 'tr' ? 'EN' : 'TR'}</button>
              <button onClick={toggleTheme} style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', fontSize: '1.1rem' }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
            </div>
            
            <div className="desktop-only">
              {currentUser ? (
                <Link href="/dashboard" className="glass" style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{currentUser.name?.[0]?.toUpperCase() || 'U'}</Link>
              ) : (
                <Link href="/login" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>{t?.nav?.login}</Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="mobile-only" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', color: 'var(--text-primary)', zIndex: 1100 }}
            >
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <div 
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          opacity: isMenuOpen ? 1 : 0, pointerEvents: isMenuOpen ? 'all' : 'none',
          transition: 'opacity 0.4s ease'
        }}
        onClick={closeMenu}
      >
        <div 
          className={isMenuOpen ? 'animate-slide-in' : ''}
          style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, width: '80%', maxWidth: 350,
            background: 'var(--bg-secondary)', borderLeft: '1px solid var(--glass-border)',
            padding: '6rem 2rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem',
            transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="mobile-menu-link"
              onClick={closeMenu}
            >{link.label}</Link>
          ))}
          
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <button onClick={toggleLanguage} style={{ flex: 1, height: 50, borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', fontSize: '1rem', fontWeight: 700 }}>{language === 'tr' ? 'English (EN)' : 'Türkçe (TR)'}</button>
               <button onClick={toggleTheme} style={{ width: 50, height: 50, borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', fontSize: '1.25rem' }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
            </div>
            
            {currentUser ? (
              <Link href="/dashboard" className="btn-primary" onClick={closeMenu} style={{ width: '100%' }}>{t?.nav?.dashboard || 'Dashboard'}</Link>
            ) : (
              <Link href="/login" className="btn-primary" onClick={closeMenu} style={{ width: '100%' }}>{t?.nav?.login}</Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
