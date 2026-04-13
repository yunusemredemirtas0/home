import { useState, useEffect } from 'react';
import { FiTrendingUp, FiActivity, FiLayers, FiMail, FiFileText } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import pb from '../../lib/pocketbase';

export default function OverviewContent() {
  const { currentUser } = useAuth();
  const [counts, setCounts] = useState({
    projects: 0,
    posts: 0,
    messages: 0,
    activeProjects: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch Projects Count
        const projectsData = await pb.collection('projects').getList(1, 1, {
            filter: 'status = "published"'
        });
        const totalProjects = await pb.collection('projects').getList(1, 1);
        
        // Fetch Posts Count
        const postsData = await pb.collection('posts').getList(1, 1);
        
        // Fetch Messages Count (unread)
        let unreadMessages = 0;
        try {
            const messagesData = await pb.collection('messages').getList(1, 1, {
                filter: 'status = "unread"'
            });
            unreadMessages = messagesData.totalItems;
        } catch (e) {
            console.log('Messages collection might not exist yet');
        }

        setCounts({
          projects: totalProjects.totalItems,
          activeProjects: projectsData.totalItems,
          posts: postsData.totalItems,
          messages: unreadMessages
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
    { label: 'Aktif Projeler', value: counts.activeProjects, icon: <FiLayers />, color: '#3b82f6' },
    { label: 'Blog Yazıları', value: counts.posts, icon: <FiFileText />, color: '#10b981' },
    { label: 'Bekleyen Mesajlar', value: counts.messages, icon: <FiMail />, color: '#f59e0b' },
  ];

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <header>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-1.5px', marginBottom: '0.5rem' }}>
            Hoş Geldin, <span className="gradient-text">{currentUser?.name?.split(' ')[0] || 'Geliştirici'}</span>!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Sisteminizdeki güncel durum ve içerik özetiniz.</p>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {stats.map((stat, i) => (
          <div key={i} className="glass" style={{ padding: '2.5rem 2rem', borderRadius: 'var(--radius-xl)', display: 'flex', gap: '1.5rem', alignItems: 'center', transition: 'transform 0.3s' }}>
            <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', color: stat.color }}>{stat.icon}</div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>{stat.label}</p>
              <div style={{ fontSize: '2.2rem', fontWeight: 900 }}>{loading ? '...' : stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass" style={{ padding: '4rem 3rem', borderRadius: 'var(--radius-xl)', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderStyle: 'dashed', borderWidth: '2px', borderColor: 'var(--glass-border)' }}>
         <div style={{ maxWidth: 500 }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 20px var(--accent))' }}>🚀</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Operasyona Hazırsın!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
                Yönetim panelinden projelerini güncelleyebilir, yeni blog yazıları paylaşabilir veya gelen mesajları kontrol edebilirsin.
            </p>
         </div>
      </div>
    </div>
  );
}
