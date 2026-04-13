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
    <section id="home" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: 'calc(var(--nav-height) + 2rem) 1.5rem 4rem' }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 700, background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 65%)', filter: 'blur(60px)' }} />
      </div>
      <div className="glass animate-fade" style={{ position: 'relative', zIndex: 1, borderRadius: 36, padding: 'clamp(2.5rem, 6vw, 4rem)', maxWidth: 600, width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ position: 'relative', width: 130, height: 130, borderRadius: '50%', padding: 3, background: 'var(--accent-gradient)', boxShadow: '0 0 40px rgba(124,58,237,0.45)', animation: 'pulseGlow 3s ease-in-out infinite' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#111' }}>
             <img src="https://ui-avatars.com/api/?name=YD&background=7c3aed&color=fff&size=200" alt="Yunus Emre" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
        <div style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)', borderRadius: 99, padding: '0.35rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: '#a78bfa', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{t?.hero?.job}</div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 3.2rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-1.5px' }}>Yunus Emre <span className="gradient-text">DEMİRTAŞ</span></h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 450 }}>{t?.hero?.subtitle}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {socials.map(s => (<a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>{s.icon}</a>))}
        </div>
      </div>
    </section>
  );
}
