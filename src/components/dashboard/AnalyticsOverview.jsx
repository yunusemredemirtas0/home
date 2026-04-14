'use client';
import { useState, useEffect } from 'react';
import { FiTrendingUp, FiLayers, FiFileText, FiEye, FiClock, FiSearch, FiLayout } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import pb from '../../lib/pocketbase';
import { useLanguage } from '../../contexts/LanguageContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass" style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--glass-border)', fontSize: '0.8rem' }}>
        <p style={{ fontWeight: 800, marginBottom: '0.25rem' }}>{label}</p>
        <p style={{ color: 'var(--accent)', fontWeight: 700 }}>{payload[0].value} Görüntülenme</p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsOverview() {
  const { t } = useLanguage();
  const [data, setData] = useState({
    posts: [],
    projects: [],
    stats: { totalViews: 0, topPost: '', topProject: '' }
  });
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const [posts, projects] = await Promise.all([
          pb.collection('posts').getFullList({ sort: '-views' }),
          pb.collection('projects').getFullList({ sort: '-views' })
        ]);

        const totalViews = [...posts, ...projects].reduce((acc, curr) => acc + (curr.views || 0), 0);
        const topPost = posts[0]?.title || '';
        const topProject = projects[0]?.title || '';

        setData({ posts, projects, stats: { totalViews, topPost, topProject } });
      } catch (error) {
        console.error('Analytics error:', error);
      } finally {
        setLoading(false);
      }
    }
    const checkMobile = () => setIsMobile(window.matchMedia('(max-width: 1024px)').matches);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    fetchAnalytics();
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const allItems = [
    ...data.posts.map(p => ({ ...p, type: 'Blog' })),
    ...data.projects.map(p => ({ ...p, type: 'Proje' }))
  ].sort((a, b) => (b.views || 0) - (a.views || 0));

  const filteredItems = allItems.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 10);

  const chartData = filteredItems.map(item => ({
    name: item.title.length > 20 ? item.title.substring(0, 20) + '...' : item.title,
    views: item.views || 0,
    type: item.type
  }));

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Analiz ediliyor...</div>;

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: 'var(--h2-size)', fontWeight: 950, letterSpacing: '-1.5px', marginBottom: '0.5rem' }}>Analitik Merkezi</h2>
        <p style={{ color: 'var(--text-secondary)' }}>İçeriklerinin performansını ve etkileşim istatistiklerini buradan takip edebilirsin.</p>
      </header>

      {/* Grid Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass card-hover" style={{ padding: '1.5rem', borderRadius: '24px', display: 'flex', gap: '1.25rem', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ width: 60, height: 60, borderRadius: '16px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}><FiEye /></div>
          <div>
            <p style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Toplam Görüntülenme</p>
            <h3 style={{ fontSize: '2rem', fontWeight: 950, background: 'linear-gradient(to right, #fff, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{data.stats.totalViews}</h3>
          </div>
        </div>
        <div className="glass card-hover" style={{ padding: '1.5rem', borderRadius: '24px', display: 'flex', gap: '1.25rem', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ width: 60, height: 60, borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}><FiFileText /></div>
          <div>
            <p style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>En Popüler Yazı</p>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{data.stats.topPost}</h3>
          </div>
        </div>
        <div className="glass card-hover" style={{ padding: '1.5rem', borderRadius: '24px', display: 'flex', gap: '1.25rem', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ width: 60, height: 60, borderRadius: '16px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}><FiLayout /></div>
          <div>
            <p style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>En Popüler Proje</p>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{data.stats.topProject}</h3>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass" style={{ padding: '2.5rem', borderRadius: '32px', minHeight: '450px', marginBottom: '3rem', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FiTrendingUp style={{ color: 'var(--accent)' }} /> Performans Analizi
            </h3>
            <div style={{ position: 'relative', width: isMobile ? '100%' : '300px' }}>
                <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input 
                    type="text" 
                    placeholder="İçerik ara..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.8rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: '#fff', fontSize: '0.85rem' }}
                />
            </div>
        </div>
        <div style={{ width: '100%', height: isMobile ? 250 : 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: isMobile ? 0 : 20, left: isMobile ? -35 : -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="views" radius={[6, 6, 0, 0]} barSize={isMobile ? 15 : 40}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.type === 'Blog' ? 'var(--accent)' : 'var(--accent-blue)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: (isMobile) ? '1fr' : '1fr 1fr', gap: '2rem' }}>
        <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
            <h4 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiFileText style={{ color: 'var(--accent)' }} /> Popüler Yazılar
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               {data.posts.slice(0, 5).map((p, i) => (
                 <div key={p.id} className="glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.3s' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>{i+1}. {p.title}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--accent)' }}>{p.views || 0}</span>
                 </div>
               ))}
               {data.posts.length === 0 && <p style={{ opacity: 0.5, fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>Henüz veri yok.</p>}
            </div>
        </div>
        <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
            <h4 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiLayers style={{ color: 'var(--accent-blue)' }} /> Popüler Projeler
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
               {data.projects.slice(0, 5).map((p, i) => (
                 <div key={p.id} className="glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.3s' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>{i+1}. {p.title}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--accent-blue)' }}>{p.views || 0}</span>
                 </div>
               ))}
                {data.projects.length === 0 && <p style={{ opacity: 0.5, fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>Henüz veri yok.</p>}
            </div>
        </div>
      </div>
    </div>
  );
}
