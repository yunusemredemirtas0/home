'use client';

import { useLanguage } from '../contexts/LanguageContext';
import { FiCode, FiLayout, FiDatabase, FiServer } from 'react-icons/fi';

export default function About() {
  const { t } = useLanguage();

  const skills = [
    { name: 'Frontend', icon: <FiLayout />, desc: 'React, Next.js, HTML/CSS, Vanilla JS' },
    { name: 'Backend', icon: <FiServer />, desc: 'Node.js, Express, REST APIs' },
    { name: 'Mimari', icon: <FiCode />, desc: 'Edge Computing, Clean Code, SSR' },
    { name: 'Veritabanı', icon: <FiDatabase />, desc: 'Firebase, Firestore, MongoDB' },
  ];

  return (
    <section id="about" style={{ padding: '6rem 0', background: 'rgba(0,0,0,0.15)' }}>
      <div className="container">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center' }}>
          
          {/* Left Text */}
          <div style={{ flex: '1 1 400px' }}>
            <h2 className="section-title">{t?.about?.title || 'Hakkımda'}</h2>
            <div style={{ width: 60, height: 4, background: 'var(--accent-gradient)', borderRadius: 2, marginBottom: '1.5rem' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2rem' }}>
              {t?.about?.desc}
            </p>
            <div style={{ display: 'flex', gap: '2.5rem' }}>
              <div>
                <div style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>5+</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Yıllık Deneyim</div>
              </div>
              <div>
                <div style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>50+</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Proje</div>
              </div>
            </div>
          </div>

          {/* Right Skills Grid */}
          <div style={{ flex: '1 1 400px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            {skills.map((skill, i) => (
              <div key={i} className="glass" style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                transition: 'transform var(--transition), border-color var(--transition)'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
              >
                <div style={{ fontSize: '2rem', color: 'var(--accent)', marginBottom: '1rem' }}>{skill.icon}</div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600 }}>{skill.name}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{skill.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
