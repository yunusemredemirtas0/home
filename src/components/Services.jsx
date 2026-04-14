'use client';
import { useLanguage } from '../contexts/LanguageContext';
import { FiMonitor, FiSmartphone, FiCode } from 'react-icons/fi';

export default function Services() {
  const { t } = useLanguage();
  const servicesList = [
    { id: 'web', icon: <FiMonitor size={36} />, title: t?.services?.web, desc: t?.services?.webDesc, gradient: 'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)' },
    { id: 'mobile', icon: <FiSmartphone size={36} />, title: t?.services?.mobile, desc: t?.services?.mobileDesc, gradient: 'linear-gradient(135deg, #10b981 0%, #f59e0b 100%)' },
    { id: 'custom', icon: <FiCode size={36} />, title: t?.services?.custom, desc: t?.services?.customDesc, gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' }
  ];
  return (
    <section id="services" style={{ padding: 'var(--section-padding) 0' }}>
      <div className="container">
        <h2 className="section-title" style={{ textAlign: 'center' }}>{t?.services?.title}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 'clamp(1.5rem, 5vw, 2.5rem)', marginTop: 'clamp(2rem, 6vw, 5rem)' }}>
          {servicesList.map(s => (
            <div key={s.id} className="glass card-hover" style={{ padding: 'clamp(1.5rem, 5vw, 3rem) clamp(1.25rem, 4vw, 2rem)', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
              <div style={{ width: 70, height: 70, margin: '0 auto', borderRadius: 'var(--radius-lg)', background: s.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>{s.icon}</div>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem' }}>{s.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1rem' }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
