'use client';

import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', flexShrink: 0 }}>
      <div style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        background: 'var(--accent-gradient)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: '0.9rem',
        color: '#fff',
        letterSpacing: '-0.5px',
        boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
      }}>YD</div>
      <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
        Yunus <span className="gradient-text">Emre</span>
      </span>
    </Link>
  );
}
