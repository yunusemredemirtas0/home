'use client';

import { useLanguage } from '../contexts/LanguageContext';
import Logo from './Logo';
import Link from 'next/link';

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  const links = [
    { label: t?.nav?.home || 'Ana Sayfa', href: '/' },
    { label: t?.nav?.about || 'Hakkımda', href: '/#about' },
    { label: t?.nav?.services || 'Hizmetler', href: '/#services' },
    { label: t?.nav?.projects || 'Projeler', href: '/#projects' },
    { label: t?.nav?.contact || 'İletişim', href: '/#contact' },
  ];

  return (
    <footer style={{
      borderTop: '1px solid var(--glass-border)',
      padding: '3rem 1.5rem',
      marginTop: '4rem',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        textAlign: 'center',
      }}>
        <Logo />

        <nav style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'color var(--transition)',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          © {year} Yunus Emre DEMİRTAŞ. {t?.footer?.rights || 'Tüm hakları saklıdır.'}
        </p>
      </div>
    </footer>
  );
}
