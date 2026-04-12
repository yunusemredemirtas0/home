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
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  if (loading || !currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewContent />;
      default: return <OverviewContent />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-color)', paddingTop: 'var(--nav-height)' }}>
      {/* Sidebar */}
      <aside className="glass" style={{ width: 280, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', borderRight: '1px solid var(--glass-border)', borderTop: 'none', borderBottom: 'none', borderLeft: 'none', borderRadius: 0 }}>
        <div style={{ paddingBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Müşteri Paneli</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{currentUser.email}</p>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <button onClick={() => setActiveTab('overview')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius-md)', background: activeTab === 'overview' ? 'var(--accent-gradient)' : 'transparent', color: activeTab === 'overview' ? '#fff' : 'var(--text-secondary)', fontWeight: 600, transition: 'all var(--transition)' }}>
            <FiGrid /> Genel Bakış
          </button>
          <button onClick={() => setActiveTab('settings')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius-md)', background: activeTab === 'settings' ? 'var(--accent-gradient)' : 'transparent', color: activeTab === 'settings' ? '#fff' : 'var(--text-secondary)', fontWeight: 600, transition: 'all var(--transition)' }}>
            <FiSettings /> Ayarlar
          </button>
        </nav>

        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', color: 'var(--error)', fontWeight: 600 }}>
          <FiLogOut /> Çıkış Yap
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
        {renderContent()}
      </main>
    </div>
  );
}
