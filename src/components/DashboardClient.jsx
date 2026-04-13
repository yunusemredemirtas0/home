'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FiGrid, FiSettings, FiLogOut } from 'react-icons/fi';
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
      <aside className="glass" style={{ width: 280, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div><h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Müşteri Paneli</h2><p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{currentUser.email}</p></div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <button onClick={() => setActiveTab('overview')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius-md)', background: activeTab === 'overview' ? 'var(--accent-gradient)' : 'transparent', color: '#fff' }}><FiGrid /> Genel Bakış</button>
        </nav>
        <button onClick={logout} style={{ color: 'var(--error)', fontWeight: 600 }}><FiLogOut /> Çıkış Yap</button>
      </aside>
      <main style={{ flex: 1, padding: '3rem' }}>{activeTab === 'overview' && <OverviewContent />}</main>
    </div>
  );
}
