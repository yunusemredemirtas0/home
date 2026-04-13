'use client';
import { useLanguage } from '../contexts/LanguageContext';
import { FiCode, FiLayout, FiDatabase, FiServer } from 'react-icons/fi';

export default function About() {
  const { t } = useLanguage();
  const skills = [
    { name: 'Frontend', icon: <FiLayout />, desc: 'React, Next.js, HTML/CSS' },
    { name: 'Backend', icon: <FiServer />, desc: 'Node.js, Express, REST APIs' },
    { name: 'Architecture', icon: <FiCode />, desc: 'Edge Computing, Clean Code' },
    { name: 'Database', icon: <FiDatabase />, desc: 'PocketBase, MongoDB, SQLite' },
  ];
  return (
    <section id="about" style={{ padding: '6rem 0', background: 'rgba(0,0,0,0.15)' }}>
      <div className="container">
        <h2 className="section-title">{t?.about?.title}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.8, maxWidth: 800 }}>{t?.about?.desc}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginTop: '3rem' }}>
          {skills.map((skill, i) => (
            <div key={i} className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '2rem', color: 'var(--accent)', marginBottom: '1rem' }}>{skill.icon}</div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600 }}>{skill.name}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{skill.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
