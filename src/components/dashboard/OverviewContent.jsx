import { useState, useEffect } from 'react';
import { FiTrendingUp, FiLayers, FiFileText } from 'react-icons/fi';
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
    { label: t?.dashboard?.stats?.activeProjects, value: counts.activeProjects, icon: <FiLayers />, color: '#3b82f6' },
    { label: t?.dashboard?.stats?.blogPosts, value: counts.posts, icon: <FiFileText />, color: '#10b981' },
    { label: t?.dashboard?.stats?.totalProjects, value: counts.projects, icon: <FiTrendingUp />, color: '#8b5cf6' },
  ];

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(2rem, 5vw, 3rem)' }}>
      <header>
        <h2 style={{ fontSize: 'var(--h2-size)', fontWeight: 950, letterSpacing: '-1.5px', marginBottom: '0.5rem' }}>
            {t?.dashboard?.welcome}, <span className="gradient-text">{currentUser?.name?.split(' ')[0] || 'Geliştirici'}</span>!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>{t?.dashboard?.stats?.overviewDesc}</p>
      </header>
      
      <div className="dashboard-grid">
        {stats.map((stat, i) => (
          <div key={i} className="glass card-hover" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1rem, 3vw, 2rem)', borderRadius: 'var(--radius-xl)', display: 'flex', gap: 'clamp(1rem, 3vw, 1.5rem)', alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', color: stat.color, flexShrink: 0 }}>{stat.icon}</div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>{stat.label}</p>
              <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2.22rem)', fontWeight: 900 }}>{loading ? '...' : stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass" style={{ padding: 'clamp(2.5rem, 6vw, 4rem) clamp(1.5rem, 4vw, 3rem)', borderRadius: 'var(--radius-xl)', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--glass-border)' }}>
         <div style={{ maxWidth: 500 }}>
            <div style={{ fontSize: 'clamp(3rem, 8vw, 4rem)', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 20px var(--accent))' }}>🚀</div>
            <h3 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 800, marginBottom: '1rem' }}>Operasyona Hazırsın!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', lineHeight: 1.6 }}>
                Yönetim panelinden projelerini güncelleyebilir veya yeni blog yazıları paylaşabilirsin.
            </p>
         </div>
      </div>
    </div>
  );
}
