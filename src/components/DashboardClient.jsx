'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FiGrid, FiSettings, FiLogOut, FiPlusCircle } from 'react-icons/fi';
import OverviewContent from './dashboard/OverviewContent';

export default function DashboardClient() {
  const { currentUser, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!loading && !currentUser) router.push('/login');
  }, [currentUser, loading, router]);

  if (loading || !currentUser) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-color)', paddingTop: 'var(--nav-height)' }}>
      <aside className="glass" style={{ width: 300, padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <div>
           <h2 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.5px' }}>Müşteri Paneli</h2>
           <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{currentUser.email}</p>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <button onClick={() => setActiveTab('overview')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '12px', background: activeTab === 'overview' ? 'var(--accent-gradient)' : 'transparent', color: activeTab === 'overview' ? '#fff' : 'var(--text-secondary)', fontWeight: 600, transition: 'all 0.3s' }}>
             <FiGrid /> Genel Bakış
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '12px', color: 'var(--text-secondary)', fontWeight: 600, opacity: 0.5 }}>
             <FiPlusCircle /> Yeni Talep
          </button>
        </nav>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '12px', color: 'var(--error)', fontWeight: 700, border: '1px solid rgba(239, 68, 68, 0.1)' }}>
           <FiLogOut /> Çıkış Yap
        </button>
      </aside>
      <main style={{ flex: 1, padding: '3.5rem' }}>
         {activeTab === 'overview' && <OverviewContent />}
      </main>
    </div>
  );
}
