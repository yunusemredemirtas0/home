'use client';

export default function OverviewContent() {
  return (
    <div className="animate-fade">
      <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>Hoş Geldiniz!</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Aktif Projeler</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-blue)' }}>0</div>
        </div>

        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Destek Talepleri</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--warning)' }}>0</div>
        </div>

        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Son Ödemeler</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)' }}>₺0</div>
        </div>
        
      </div>
      
      <div style={{ marginTop: '3rem' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>Son Aktiviteler</h3>
        <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Henüz bir aktivite bulunmuyor.
        </div>
      </div>
    </div>
  );
}
