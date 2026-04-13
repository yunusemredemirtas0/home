'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FiGrid, FiSettings, FiLogOut, FiPlusCircle, FiFileText, FiLayout, FiChevronLeft, FiChevronRight, FiMail } from 'react-icons/fi';
import dynamic from 'next/dynamic';

const OverviewContent = dynamic(() => import('./dashboard/OverviewContent'), { ssr: false });
const BlogManager = dynamic(() => import('./dashboard/BlogManager'), { ssr: false });
const ProjectManager = dynamic(() => import('./dashboard/ProjectManager'), { ssr: false });

export default function DashboardClient() {
  const { currentUser, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isMounted, setIsMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !currentUser) router.push('/login');
  }, [currentUser, loading, router]);

  if (!isMounted || loading || !currentUser) return (
     <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Yükleniyor...</p>
     </div>
  );

  const isAdmin = currentUser.role === 'admin' || currentUser.email === 'yunusemredemirtas.dev@gmail.com';

  const menuItems = [
    { id: 'overview', label: 'Genel Bakış', icon: <FiGrid />, adminOnly: false },
    { id: 'blogs', label: 'Blog Yönetimi', icon: <FiFileText />, adminOnly: true },
    { id: 'projects', label: 'Proje Yönetimi', icon: <FiLayout />, adminOnly: true },
  ];

  const sidebarWidth = isCollapsed ? 80 : 320;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-color)' }}>
      <aside 
        className="glass" 
        style={{ 
          width: sidebarWidth, 
          padding: isCollapsed ? '2.5rem 0.75rem' : '2.5rem 1.5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '2.5rem', 
          borderRight: '1px solid var(--glass-border)', 
          position: 'fixed', 
          left: 0, 
          bottom: 0, 
          top: 0,
          transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 100,
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-end', width: '100%' }}>
           <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{ 
              width: 32, height: 32, borderRadius: '8px', background: 'rgba(255,255,255,0.05)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', cursor: 'pointer' 
            }}
           >
              {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
           </button>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {menuItems.map(item => {
            if (item.adminOnly && !isAdmin) return null;
            return (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)} 
                title={isCollapsed ? item.label : ''}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  gap: isCollapsed ? '0' : '1rem', 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  background: activeTab === item.id ? 'var(--accent-gradient)' : 'transparent', 
                  color: activeTab === item.id ? '#fff' : 'var(--text-secondary)', 
                  fontWeight: 600, 
                  transition: 'all 0.3s',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  overflow: 'hidden'
                }}
              >
                 <span style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                 {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
           <button 
            onClick={logout} 
            title={isCollapsed ? 'Çıkış Yap' : ''}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-start', 
              gap: isCollapsed ? '0' : '1rem', padding: '1rem', borderRadius: '12px', 
              color: 'var(--error)', fontWeight: 700, border: '1px solid rgba(239, 68, 68, 0.1)', 
              background: 'transparent', cursor: 'pointer', width: '100%' 
            }}
           >
              <span style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}><FiLogOut /></span>
              {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>Çıkış Yap</span>}
           </button>
           
           {!isCollapsed && (
             <div className="glass" style={{ padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>
                   {currentUser.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                   <p style={{ fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{currentUser.name || 'User'}</p>
                   <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', marginBottom: '0.1rem' }}>{isAdmin ? 'Administrator' : 'Client'}</p>
                   <p style={{ fontSize: '0.6rem', color: 'var(--accent-blue)', whiteSpace: 'nowrap', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>{currentUser.email}</p>
                </div>
             </div>
           )}
        </div>
      </aside>

      <main style={{ flex: 1, padding: '4rem', marginLeft: sidebarWidth, transition: 'margin 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
         {activeTab === 'overview' && <OverviewContent />}
         {activeTab === 'blogs' && <BlogManager />}
         {activeTab === 'projects' && <ProjectManager />}
         {activeTab === 'projects' && <ProjectManager />}
      </main>
    </div>
  );
}
