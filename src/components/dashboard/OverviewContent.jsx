import { useState, useEffect } from 'react';
import { FiTrendingUp, FiLayers, FiFileText, FiChevronRight, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import pb from '../../lib/pocketbase';
import { useLanguage } from '../../contexts/LanguageContext';

export default function OverviewContent() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [counts, setCounts] = useState({
    projects: 0,
    posts: 0,
    activeProjects: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const projectsData = await pb.collection('projects').getList(1, 1, {
            filter: 'status = "published"'
        });
        const totalProjects = await pb.collection('projects').getList(1, 1);
        const postsData = await pb.collection('posts').getList(1, 1);
        
        setCounts({
          projects: totalProjects.totalItems,
          activeProjects: projectsData.totalItems,
          posts: postsData.totalItems
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const stats = [
    { label: t?.dashboard?.stats?.activeProjects, value: counts.activeProjects, icon: <FiCheckCircle />, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    { label: t?.dashboard?.stats?.blogPosts, value: counts.posts, icon: <FiFileText />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    { label: t?.dashboard?.stats?.totalProjects, value: counts.projects, icon: <FiLayers />, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  ];

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <header style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 950, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: '0.75rem' }}>
            {t?.dashboard?.welcome}, <span className="gradient-text">{currentUser?.name?.split(' ')[0] || 'Geliştirici'}</span>!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px' }}>{t?.dashboard?.stats?.overviewDesc}</p>
      </header>
      
      <div className="dashboard-grid">
        {stats.map((stat, i) => (
          <div key={i} className="glass card-hover" style={{ padding: '2.5rem', borderRadius: '32px', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)' }}>
            <div style={{ width: 56, height: 56, borderRadius: '16px', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{stat.icon}</div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.5rem' }}>{stat.label}</p>
              <div style={{ fontSize: '2.5rem', fontWeight: 950, color: '#fff' }}>{loading ? '...' : stat.value}</div>
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>
                Detayları Gör <FiChevronRight />
            </div>
          </div>
        ))}
      </div>

      <div className="glass" style={{ padding: '4rem 2rem', borderRadius: '40px', minHeight: 450, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 50px 100px -30px rgba(124,58,237,0.2)' }}>
         <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.05) 0%, transparent 70%)' }}></div>
         <div style={{ maxWidth: 550, position: 'relative', zIndex: 1 }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', margin: '0 auto 2.5rem', boxShadow: '0 0 50px rgba(124,58,237,0.4)', animation: 'float 6s ease-in-out infinite' }}>🚀</div>
            <h3 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1.5rem', color: '#fff' }}>Hızlı Başlangıç Rehberi</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
                Yönetim panelinden projelerini güncelleyebilir, yeni blog yazıları paylaşabilir veya SEO ayarlarını optimize edebilirsin.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn-primary" style={{ padding: '1rem 2rem' }}>Yeni İçerik Ekle</button>
                <button className="btn-secondary" style={{ padding: '1rem 2rem' }}>SEO Ayarlarını Kontrol Et</button>
            </div>
         </div>
         <style jsx>{`
            @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
            }
         `}</style>
      </div>
    </div>
  );
}
