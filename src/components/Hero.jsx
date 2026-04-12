'use client';

import { useLanguage } from '../contexts/LanguageContext';
import { FaGithub, FaLinkedinIn, FaInstagram } from 'react-icons/fa';

export default function Hero() {
  const { t } = useLanguage();

  const socials = [
    { icon: <FaGithub size={20} />, href: 'https://github.com/yunusemredemirtas0', label: 'GitHub' },
    { icon: <FaLinkedinIn size={20} />, href: 'https://www.linkedin.com/in/yunusemredemirtas0/', label: 'LinkedIn' },
    { icon: <FaInstagram size={20} />, href: 'https://www.instagram.com/yunuus.ed61/', label: 'Instagram' },
  ];

  return (
    <section
      id="home"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: 'calc(var(--nav-height) + 2rem) 1.5rem 4rem',
      }}
    >
      {/* Background glows */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 700,
          background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '10%',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }} />
      </div>

      {/* Hero Card */}
      <div
        className="glass animate-fade"
        style={{
          position: 'relative',
          zIndex: 1,
          borderRadius: 36,
          padding: 'clamp(2.5rem, 6vw, 4rem) clamp(2rem, 5vw, 3.5rem)',
          maxWidth: 600,
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        {/* Avatar */}
        <div style={{
          position: 'relative',
          width: 130,
          height: 130,
          borderRadius: '50%',
          padding: 3,
          background: 'var(--accent-gradient)',
          boxShadow: '0 0 40px rgba(124,58,237,0.45)',
          animation: 'pulseGlow 3s ease-in-out infinite',
          flexShrink: 0,
        }}>
          <div style={{
            width: '100%', height: '100%',
            borderRadius: '50%',
            overflow: 'hidden',
            background: '#111',
          }}>
            <img
              src="/profile.jpg"
              alt="Yunus Emre DEMİRTAŞ"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=YD&background=7c3aed&color=fff&size=200'; }}
            />
          </div>
        </div>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(124,58,237,0.15)',
          border: '1px solid rgba(124,58,237,0.35)',
          borderRadius: 99,
          padding: '0.35rem 1rem',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#a78bfa',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#a78bfa', display: 'inline-block', boxShadow: '0 0 6px #a78bfa' }} />
          {t?.hero?.job}
        </div>

        {/* Name */}
        <div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 3.2rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-1.5px', marginBottom: '0.2rem' }}>
            Yunus Emre
          </h1>
          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 3.2rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-1.5px' }} className="gradient-text">
            DEMİRTAŞ
          </h1>
        </div>

        {/* Subtitle */}
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 450 }}>
          {t?.hero?.subtitle}
        </p>

        {/* Socials */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {socials.map(s => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              style={{
                width: 44, height: 44,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--glass-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)',
                transition: 'color var(--transition), border-color var(--transition), background var(--transition), transform var(--transition)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.background = 'rgba(124,58,237,0.1)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {s.icon}
            </a>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: '100%', height: 1, background: 'var(--glass-border)' }} />

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
          <a href="/#services" className="btn-primary" style={{ flex: '1 1 140px' }}>
            {t?.hero?.cta}
          </a>
          <a href="/#contact" className="btn-secondary" style={{ flex: '1 1 140px' }}>
            {t?.nav?.contact}
          </a>
        </div>
      </div>
    </section>
  );
}
