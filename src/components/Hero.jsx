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
    <section id="home" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: 'calc(var(--nav-height) + 2.5rem) 1.5rem 5rem' }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '80vw', height: '80vw', maxWidth: 1000, background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>
      
      <div className="container" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div className="glass animate-fade" style={{ borderRadius: 'var(--radius-xl)', padding: 'clamp(2rem, 8vw, 4.5rem)', maxWidth: 850, width: '100%', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
          
          {/* Enhanced Avatar Container */}
          <div style={{ position: 'relative', width: 140, height: 140, borderRadius: '50%', padding: '3px', background: 'var(--accent-gradient)', boxShadow: '0 20px 40px rgba(124,58,237,0.25)' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#050508', border: '2px solid rgba(255,255,255,0.05)' }}>
               <img src="/profile.png" alt="Yunus Emre" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.05)' }} />
            </div>
            <div style={{ position: 'absolute', bottom: 5, right: 5, width: 22, height: 22, background: 'var(--success)', borderRadius: '50%', border: '3px solid #050508', boxShadow: '0 0 10px var(--success)' }} title="Available for work" />
          </div>

          <div>
            <div className="animate-fade" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 99, padding: '0.5rem 1.4rem', fontSize: '0.75rem', fontWeight: 900, color: '#a78bfa', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1.75rem' }}>
               <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2s infinite' }} />
               {t?.hero?.job}
            </div>
            <h1 style={{ fontSize: 'var(--h1-size)', fontWeight: 950, lineHeight: 1.05, letterSpacing: '-3px', marginBottom: '1.5rem', color: '#fff' }}>
              Yunus Emre <span className="gradient-text">DEMİRTAŞ</span>
            </h1>
            <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 580, margin: '0 auto', fontWeight: 500 }}>
              {t?.hero?.subtitle}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
            <a href="#services" className="btn-primary" style={{ minWidth: '180px' }}>{t?.hero?.cta}</a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              {socials.map(s => (
                <a 
                  key={s.label} 
                  href={s.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  title={s.label}
                  className="glass card-hover"
                  style={{ width: 48, height: 48, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '1.3rem' }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
