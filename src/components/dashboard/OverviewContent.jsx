'use client';
export default function OverviewContent() {
  return (
    <div className="animate-fade">
      <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>Hoş Geldiniz!</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}><h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Aktif Projeler</h3><div style={{ fontSize: '2.5rem', fontWeight: 800 }}>0</div></div>
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}><h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Destek Talepleri</h3><div style={{ fontSize: '2.5rem', fontWeight: 800 }}>0</div></div>
      </div>
    </div>
  );
}
