'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FiGrid, FiSettings, FiLogOut, FiPlusCircle, FiFileText, FiLayout } from 'react-icons/fi';
import OverviewContent from './dashboard/OverviewContent';
import BlogManager from './dashboard/BlogManager';
import ProjectManager from './dashboard/ProjectManager';

export default function DashboardClient() {
  const { currentUser, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!loading && !currentUser) router.push('/login');
  }, [currentUser, loading, router]);

  if (loading || !currentUser) return null;

  const isAdmin = currentUser.role === 'admin' || currentUser.email === 'yunusemredemirtas.dev@gmail.com';

  const menuItems = [
    { id: 'overview', label: 'Genel Bakış', icon: <FiGrid />, adminOnly: false },
    { id: 'blogs', label: 'Blog Yönetimi', icon: <FiFileText />, adminOnly: true },
    { id: 'projects', label: 'Proje Yönetimi', icon: <FiLayout />, adminOnly: true },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-color)', paddingTop: 'var(--nav-height)' }}>
      {/* Sidebar */}
      <aside className="glass" style={{ width: 320, padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem', borderRight: '1px solid var(--glass-border)', position: 'fixed', left: 0, bottom: 0, top: 'var(--nav-height)' }}>
        <div>
           <h2 style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
              {isAdmin ? 'Yönetim Paneli' : 'Müşteri Paneli'}
           </h2>
           <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{currentUser.email}</p>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {menuItems.map(item => {
            if (item.adminOnly && !isAdmin) return null;
            return (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem', 
                  padding: '1rem 1.25rem', 
                  borderRadius: '12px', 
                  background: activeTab === item.id ? 'var(--accent-gradient)' : 'transparent', 
                  color: activeTab === item.id ? '#fff' : 'var(--text-secondary)', 
                  fontWeight: 600, 
                  transition: 'all 0.3s',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                 {item.icon} {item.label}
              </button>
            );
          })}
          
          {!isAdmin && (
            <button style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '12px', color: 'var(--text-secondary)', fontWeight: 600, opacity: 0.5, border: 'none', cursor: 'not-allowed' }}>
               <FiPlusCircle /> Yeni Talep
            </button>
          )}
        </nav>

        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '12px', color: 'var(--error)', fontWeight: 700, border: '1px solid rgba(239, 68, 68, 0.1)', background: 'transparent', cursor: 'pointer' }}>
           <FiLogOut /> Çıkış Yap
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '4rem', marginLeft: 320 }}>
         {activeTab === 'overview' && <OverviewContent />}
         {activeTab === 'blogs' && <BlogManager />}
         {activeTab === 'projects' && <ProjectManager />}
      </main>
    </div>
  );
}
