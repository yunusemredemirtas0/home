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
  const isDashboard = pathname?.startsWith('/dashboard');

  if (isDashboard) return null;

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
          {!isDashboard && (
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
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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

            {/* Mobile Menu Toggle - Only if not dashboard */}
            {!isDashboard && (
              <button 
                className="mobile-only" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', color: 'var(--text-primary)', zIndex: 1100, background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}
              >
                {isMenuOpen ? <FiX /> : <FiMenu />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer (Ultra-Premium Redesign) */}
      <div 
        style={{
          position: 'fixed', inset: 0, zIndex: 1200,
          background: 'rgba(5, 5, 8, 0.4)', backdropFilter: 'blur(35px) saturate(180%)',
          opacity: isMenuOpen ? 1 : 0, pointerEvents: isMenuOpen ? 'all' : 'none',
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        <button 
          onClick={closeMenu}
          style={{ position: 'fixed', top: '2rem', right: '2rem', width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 1300 }}
        >
          <FiX />
        </button>

        <div 
          style={{
            width: '100%', maxWidth: '450px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
            transform: isMenuOpen ? 'translateY(0)' : 'translateY(30px)',
            transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
            textAlign: 'center'
          }}
        >
          <div style={{ marginBottom: '3rem' }}>
             <Logo />
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                style={{ 
                  fontSize: '2rem', fontWeight: 950, padding: '1rem', color: '#fff', 
                  letterSpacing: '-1px', transition: 'all 0.3s',
                  opacity: isMenuOpen ? 1 : 0,
                  transform: isMenuOpen ? 'translateY(0)' : 'translateY(20px)',
                  transitionDelay: `${i * 0.07}s`
                }}
                className="hover-accent"
              >{link.label}</Link>
            ))}
          </nav>
          
          <div style={{ marginTop: '4rem', display: 'flex', flexDirection: 'column', gap: '2rem', opacity: isMenuOpen ? 1 : 0, transition: 'all 0.6s 0.4s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
               <button onClick={toggleLanguage} style={{ padding: '0.75rem 1.5rem', borderRadius: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.9rem', fontWeight: 800 }}>{language === 'tr' ? 'EN' : 'TR'}</button>
               <button onClick={toggleTheme} style={{ width: 50, height: 50, borderRadius: '15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '1.25rem' }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
            </div>
            
            {currentUser ? (
              <Link href="/dashboard" className="btn-primary" onClick={closeMenu} style={{ width: '100%', padding: '1.2rem', borderRadius: '18px', fontSize: '1rem', fontWeight: 900 }}>{t?.nav?.dashboard || 'Dashboard'}</Link>
            ) : (
              <Link href="/login" className="btn-primary" onClick={closeMenu} style={{ width: '100%', padding: '1.2rem', borderRadius: '18px', fontSize: '1rem', fontWeight: 900 }}>{t?.nav?.login}</Link>
            )}
            
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', opacity: 0.5 }}>
               <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>LINKEDIN</span>
               <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>GITHUB</span>
               <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>TWITTER</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
