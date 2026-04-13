'use client';
import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', flexShrink: 0 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: 'var(--accent-gradient)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 900, fontSize: '0.95rem', color: '#fff',
        boxShadow: '0 4px 15px rgba(124,58,237,0.4)',
      }}>YD</div>
      <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
        Yunus <span className="gradient-text">Emre</span>
      </span>
    </Link>
  );
}
