'use client';
import { useLanguage } from '../contexts/LanguageContext';
import { FaGithub, FaLinkedinIn, FaInstagram } from 'react-icons/fa';

export default function Hero() {
  const { t } = useLanguage();
  const socials = [
    { icon: <FaGithub size={20} />, href: 'https://github.com/yunusemredemirtas0', label: 'GitHub' },
    { icon: <FaLinkedinIn size={20} />, href: 'https://tr.linkedin.com/in/yunusemredemirtas0', label: 'LinkedIn' },
    { icon: <FaInstagram size={20} />, href: 'https://www.instagram.com/yunuus.ed61/', label: 'Instagram' },
  ];

  return (
    <section id="home" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: 'calc(var(--nav-height) + 2rem) 1.5rem 4rem' }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 700, background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 65%)', filter: 'blur(60px)' }} />
      </div>
      <div className="glass animate-fade" style={{ position: 'relative', zIndex: 1, borderRadius: 36, padding: 'clamp(2.5rem, 6vw, 4rem)', maxWidth: 650, width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.75rem' }}>
        <div style={{ position: 'relative', width: 140, height: 140, borderRadius: '50%', padding: 4, background: 'var(--accent-gradient)', boxShadow: '0 0 40px rgba(124,58,237,0.4)', animation: 'pulseGlow 3s ease-in-out infinite' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#111' }}>
             <img src="https://ui-avatars.com/api/?name=YD&background=7c3aed&color=fff&size=200" alt="Yunus Emre" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
        <div>
          <div style={{ display: 'inline-block', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 99, padding: '0.4rem 1.25rem', fontSize: '0.8rem', fontWeight: 800, color: '#a78bfa', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>{t?.hero?.job}</div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 3.8rem)', fontWeight: 950, lineHeight: 1, letterSpacing: '-2px', marginBottom: '1.5rem' }}>Yunus Emre <span className="gradient-text">DEMİRTAŞ</span></h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 500, margin: '0 auto' }}>{t?.hero?.subtitle}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="#services" className="btn-primary">{t?.hero?.cta}</a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {socials.map(s => (<a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', transition: 'color 0.3s' }}>{s.icon}</a>))}
          </div>
        </div>
      </div>
    </section>
  );
}
