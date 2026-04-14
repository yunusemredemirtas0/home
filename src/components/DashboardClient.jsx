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
        className={`glass dashboard-sidebar ${isMobileMenuOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`} 
        style={{ 
          padding: isCollapsed && !isMobileMenuOpen ? '2.5rem 0.75rem' : '2.5rem 1.5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '2.5rem', 
          borderRight: '1px solid var(--glass-border)', 
          overflow: 'hidden'
        }}
      >
        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'flex-end', width: '100%' }}>
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

        {isMobileMenuOpen && (
          <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
             <h2 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 900 }}>DASHBOARD</h2>
          </div>
        )}
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {menuItems.map(item => {
            if (item.adminOnly && !isAdmin) return null;
            return (
              <button 
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} 
                title={(isCollapsed && !isMobileMenuOpen) ? item.label : ''}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: (isCollapsed && !isMobileMenuOpen) ? 'center' : 'flex-start',
                  gap: (isCollapsed && !isMobileMenuOpen) ? '0' : '1rem', 
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
                 {(!isCollapsed || isMobileMenuOpen) && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
           <button 
            onClick={logout} 
            title={(isCollapsed && !isMobileMenuOpen) ? t?.auth?.logout : ''}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: (isCollapsed && !isMobileMenuOpen) ? 'center' : 'flex-start', 
              gap: (isCollapsed && !isMobileMenuOpen) ? '0' : '1rem', padding: '1rem', borderRadius: '12px', 
              color: 'var(--error)', fontWeight: 700, border: '1px solid rgba(239, 68, 68, 0.1)', 
              background: 'transparent', cursor: 'pointer', width: '100%' 
            }}
           >
              <span style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}><FiLogOut /></span>
              {(!isCollapsed || isMobileMenuOpen) && <span style={{ whiteSpace: 'nowrap' }}>{t?.auth?.logout}</span>}
           </button>
           
           {(!isCollapsed || isMobileMenuOpen) && (
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
