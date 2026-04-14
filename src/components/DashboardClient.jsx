'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FiGrid, FiSettings, FiLogOut, FiPlusCircle, FiFileText, FiLayout, FiChevronLeft, FiChevronRight, FiMail, FiMenu, FiX, FiTrendingUp, FiSearch } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import { useLanguage } from '../contexts/LanguageContext';

const OverviewContent = dynamic(() => import('./dashboard/OverviewContent'), { ssr: false });
const BlogManager = dynamic(() => import('./dashboard/BlogManager'), { ssr: false });
const ProjectManager = dynamic(() => import('./dashboard/ProjectManager'), { ssr: false });
const AnalyticsOverview = dynamic(() => import('./dashboard/AnalyticsOverview'), { ssr: false });
const SEOManager = dynamic(() => import('./dashboard/SEOManager'), { ssr: false });

export default function DashboardClient() {
  const { currentUser, loading, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isMounted, setIsMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    { id: 'overview', label: t?.dashboard?.overview, icon: <FiGrid />, adminOnly: false },
    { id: 'analytics', label: 'Analitik', icon: <FiTrendingUp />, adminOnly: true },
    { id: 'blogs', label: t?.dashboard?.blogMode, icon: <FiFileText />, adminOnly: true },
    { id: 'projects', label: t?.dashboard?.projectMode, icon: <FiLayout />, adminOnly: true },
    { id: 'seo', label: 'SEO Ayarları', icon: <FiSearch />, adminOnly: true },
  ];

  return (
    <div className="dashboard-layout" style={{ background: 'var(--bg-color)' }}>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="mobile-only glass"
        style={{ 
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 1100, 
          width: 50, height: 50, borderRadius: '12px', display: 'flex', 
          alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'var(--accent)'
        }}
      >
        {isMobileMenuOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Sidebar overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-only"
          onClick={() => setIsMobileMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 900, backdropFilter: 'blur(8px)' }} 
        />
      )}

      <aside 
        className={`dashboard-sidebar ${isMobileMenuOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`} 
        style={{ 
          padding: isCollapsed && !isMobileMenuOpen ? '2.5rem 1rem' : '2.5rem 1.75rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '3rem', 
          borderRight: '1px solid rgba(255,255,255,0.08)', 
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', width: '100%', marginBottom: '1rem' }}>
           {(!isCollapsed || isMobileMenuOpen) && <h2 className="gradient-text" style={{ fontSize: '1.4rem', fontWeight: 950, letterSpacing: '-1px' }}>ADMIN</h2>}
           <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="desktop-only"
            style={{ 
              width: 36, height: 36, borderRadius: '10px', background: 'rgba(255,255,255,0.03)', 
              color: 'var(--accent)', border: '1px solid rgba(255,255,255,0.05)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', cursor: 'pointer', transition: 'all 0.3s'
            }}
           >
              {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
           </button>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
          {menuItems.map(item => {
            if (item.adminOnly && !isAdmin) return null;
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} 
                title={(isCollapsed && !isMobileMenuOpen) ? item.label : ''}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: (isCollapsed && !isMobileMenuOpen) ? 'center' : 'flex-start',
                  gap: (isCollapsed && !isMobileMenuOpen) ? '0' : '1.25rem', 
                  padding: isCollapsed ? '1.1rem 0' : '1.1rem 1.25rem', 
                  borderRadius: '16px', 
                  background: isActive ? 'var(--accent-gradient)' : 'transparent', 
                  color: isActive ? '#fff' : 'var(--text-secondary)', 
                  fontWeight: isActive ? 800 : 600, 
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  overflow: 'hidden',
                  boxShadow: isActive ? '0 15px 30px -5px rgba(124,58,237,0.4)' : 'none',
                  position: 'relative'
                }}
                className="hover-accent-bg"
              >
                 {isActive && (
                   <div style={{ position: 'absolute', right: 0, top: '20%', bottom: '20%', width: 4, background: '#fff', borderRadius: '4px 0 0 4px' }} />
                 )}
                 <span style={{ fontSize: isCollapsed ? '1.6rem' : '1.35rem', display: 'flex', alignItems: 'center', transition: 'transform 0.3s ease' }} className={isActive ? 'animate-pulse' : ''}>{item.icon}</span>
                 {(!isCollapsed || isMobileMenuOpen) && <span style={{ whiteSpace: 'nowrap', fontSize: '0.95rem' }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <button 
            onClick={logout} 
            title={(isCollapsed && !isMobileMenuOpen) ? t?.auth?.logout : ''}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: (isCollapsed && !isMobileMenuOpen) ? 'center' : 'flex-start', 
              gap: (isCollapsed && !isMobileMenuOpen) ? '0' : '1.25rem', padding: '1rem', borderRadius: '15px', 
              color: 'rgba(239, 68, 68, 0.8)', fontWeight: 800, border: '1px solid rgba(239, 68, 68, 0.1)', 
              background: 'rgba(239, 68, 68, 0.03)', cursor: 'pointer', width: '100%', transition: 'all 0.3s'
            }}
            className="hover-error-bg"
           >
              <span style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center' }}><FiLogOut /></span>
              {(!isCollapsed || isMobileMenuOpen) && <span style={{ whiteSpace: 'nowrap', fontSize: '0.9rem' }}>{t?.auth?.logout}</span>}
           </button>
           
           {(!isCollapsed || isMobileMenuOpen) ? (
             <div className="glass" style={{ padding: '1rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 900, color: '#fff', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>
                   {currentUser.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                   <p style={{ fontSize: '0.85rem', fontWeight: 800, whiteSpace: 'nowrap', color: '#fff' }}>{currentUser.name || 'User'}</p>
                   <p style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700, whiteSpace: 'nowrap' }}>{isAdmin ? 'Super Admin' : 'Client'}</p>
                </div>
             </div>
           ) : (
             <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 45, height: 45, borderRadius: '12px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 900, color: '#fff', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
                   {currentUser.name?.[0]?.toUpperCase() || 'U'}
                </div>
             </div>
           )}
        </div>
      </aside>

      <main className="dashboard-main">
         <div className="dashboard-content-container">
            {activeTab === 'overview' && <OverviewContent />}
            {activeTab === 'analytics' && <AnalyticsOverview />}
            {activeTab === 'blogs' && <BlogManager />}
            {activeTab === 'projects' && <ProjectManager />}
            {activeTab === 'seo' && <SEOManager />}
         </div>
      </main>
    </div>
  );
}
