'use client';
import { FiTrendingUp, FiActivity, FiLayers } from 'react-icons/fi';

export default function OverviewContent() {
  const stats = [
    { label: 'Aktif Projeler', value: '0', icon: <FiLayers />, color: '#3b82f6' },
    { label: 'Tamamlanan İşler', value: '0', icon: <FiTrendingUp />, color: '#10b981' },
    { label: 'Destek Talepleri', value: '0', icon: <FiActivity />, color: '#f59e0b' },
  ];

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <header>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-1.5px', marginBottom: '0.5rem' }}>Hoş Geldiniz!</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Sisteminizdeki güncel durum ve projeleriniz.</p>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {stats.map((stat, i) => (
          <div key={i} className="glass" style={{ padding: '2.5rem 2rem', borderRadius: 'var(--radius-xl)', display: 'flex', gap: '1.5rem', alignItems: 'center', transition: 'transform 0.3s' }}>
            <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', color: stat.color }}>{stat.icon}</div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>{stat.label}</p>
              <div style={{ fontSize: '2.2rem', fontWeight: 900 }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderStyle: 'dashed', borderWidth: '2px' }}>
         <div>
            <div style={{ fontSize: '3rem', opacity: 0.2, marginBottom: '1.5rem' }}>🗄️</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Henüz aktif bir projeniz bulunmuyor.</p>
         </div>
      </div>
    </div>
  );
}
