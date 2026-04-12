'use client';

import { useLanguage } from '../contexts/LanguageContext';
import { FiMonitor, FiTrendingUp, FiCode } from 'react-icons/fi';

export default function Services() {
  const { t } = useLanguage();

  const servicesList = [
    {
      id: 'web',
      icon: <FiMonitor size={32} />,
      title: t?.services?.web,
      desc: t?.services?.webDesc,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)',
      shadow: 'rgba(59, 130, 246, 0.4)'
    },
    {
      id: 'seo',
      icon: <FiTrendingUp size={32} />,
      title: t?.services?.seo,
      desc: t?.services?.seoDesc,
      gradient: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)',
      shadow: 'rgba(16, 185, 129, 0.4)'
    },
    {
      id: 'custom',
      icon: <FiCode size={32} />,
      title: t?.services?.custom,
      desc: t?.services?.customDesc,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
      shadow: 'rgba(139, 92, 246, 0.4)'
    }
  ];

  return (
    <section id="services" style={{ padding: '6rem 0', position: 'relative' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 className="section-title">{t?.services?.title || 'Hizmetlerim'}</h2>
          <div style={{ width: 60, height: 4, background: 'var(--accent-gradient)', margin: '0 auto', borderRadius: 2 }} />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {servicesList.map(s => (
            <div key={s.id} className="glass" style={{
              padding: '2.5rem 2rem',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              transition: 'transform var(--transition), box-shadow var(--transition), border-color var(--transition)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.boxShadow = `0 20px 40px ${s.shadow.replace('0.4', '0.15')}`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--glass-border)';
              e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
            }}>
              <div style={{
                width: 70, height: 70,
                borderRadius: 'var(--radius-lg)',
                background: s.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff',
                boxShadow: `0 10px 20px ${s.shadow}`
              }}>
                {s.icon}
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{s.title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
