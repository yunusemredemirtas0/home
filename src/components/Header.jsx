'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

export default function Header() {
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const navLinks = [
    { label: t?.nav?.home || 'Ana Sayfa',    href: '/' },
    { label: t?.nav?.about || 'Hakkımda',    href: '/#about' },
    { label: t?.nav?.services || 'Hizmetler', href: '/#services' },
    { label: t?.nav?.projects || 'Projeler', href: '/#projects' },
    { label: t?.nav?.contact || 'İletişim',  href: '/#contact' },
  ];

  const handleLogout = async () => {
    try { await logout(); router.push('/'); } catch {}
  };

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href) || pathname + window.location.hash === href;
  };

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          height: 'var(--nav-height)',
          transition: 'background 0.3s, border-color 0.3s',
          ...(scrolled
            ? { background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid var(--glass-border)' }
            : { background: 'transparent', borderBottom: '1px solid transparent' }),
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1.5rem',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '2rem',
          }}
        >
          <Logo />

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1, justifyContent: 'center' }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.92rem',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  background: 'transparent',
                  transition: 'color var(--transition), background var(--transition)',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--glass-bg)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <button
              onClick={toggleLanguage}
              style={{
                width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)',
                transition: 'background var(--transition), color var(--transition)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              {language === 'tr' ? 'EN' : 'TR'}
            </button>

            <button
              onClick={toggleTheme}
              style={{
                width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', color: 'var(--text-secondary)',
                transition: 'background var(--transition), color var(--transition)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-bg)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link href="/dashboard">
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--accent-gradient)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', fontWeight: 700, color: '#fff',
                  }}>
                    {currentUser.displayName?.[0]?.toUpperCase() || '?'}
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600,
                    padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)',
                    transition: 'background var(--transition)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Çıkış
                </button>
              </div>
            ) : (
              <Link href="/login">
                <div className="accent-button" style={{ padding: '0.5rem 1.2rem', fontSize: '0.88rem' }}>
                  {t?.nav?.login || 'Giriş'}
                </div>
              </Link>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                display: 'none',
                width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}
              id="hamburger-btn"
            >
              <span style={{ width: 20, height: 2, background: 'var(--text-primary)', display: 'block', borderRadius: 2 }} />
              <span style={{ width: 20, height: 2, background: 'var(--text-primary)', display: 'block', borderRadius: 2 }} />
              <span style={{ width: 20, height: 2, background: 'var(--text-primary)', display: 'block', borderRadius: 2 }} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div style={{
          position: 'fixed', top: 'var(--nav-height)', left: 0, right: 0,
          background: 'rgba(5,5,8,0.97)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--glass-border)', padding: '1.5rem', zIndex: 999, display: 'flex', flexDirection: 'column', gap: '0.5rem',
        }}>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={{
              padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)',
            }}>
              {link.label}
            </Link>
          ))}
        </div>
      )}
      <style>{`
        @media (max-width: 768px) {
          nav { display: none !important; }
          #hamburger-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
