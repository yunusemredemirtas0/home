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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '2.5rem', marginTop: 'clamp(2.5rem, 8vw, 5rem)' }}>
          {servicesList.map(s => (
            <div key={s.id} className="glass card-hover" style={{ padding: 'clamp(2rem, 5vw, 3.5rem) clamp(1.5rem, 4vw, 2.5rem)', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'center' }}>
              <div style={{ width: 85, height: 85, margin: '0 auto', borderRadius: 'var(--radius-lg)', background: s.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>{s.icon}</div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>{s.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
