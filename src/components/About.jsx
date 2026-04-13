'use client';
import { useLanguage } from '../contexts/LanguageContext';
import { FiCode, FiLayout, FiDatabase, FiServer } from 'react-icons/fi';

export default function About() {
  const { t } = useLanguage();
  const skills = [
    { name: 'Frontend', icon: <FiLayout />, desc: 'React 19, Next.js 15, responsive web' },
    { name: 'Backend', icon: <FiServer />, desc: 'Node.js, Express, PocketBase APIs' },
    { name: 'Mobile', icon: <FiCode />, desc: 'React Native, iOS & Android apps' },
    { name: 'Architecture', icon: <FiDatabase />, desc: 'Full Stack Design, Clean Code' },
  ];
  return (
    <section id="about" style={{ padding: '8rem 0', background: 'rgba(0,0,0,0.1)' }}>
      <div className="container">
        <h2 className="section-title">{t?.about?.title}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: 1.8, maxWidth: 850, marginTop: '1.5rem' }}>{t?.about?.desc}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginTop: '4rem' }}>
          {skills.map((skill, i) => (
            <div key={i} className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', transition: 'transform 0.3s' }}>
              <div style={{ fontSize: '2.5rem', color: 'var(--accent)', marginBottom: '1.5rem' }}>{skill.icon}</div>
              <h4 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 750 }}>{skill.name}</h4>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{skill.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
