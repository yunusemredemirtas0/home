'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FiTrendingUp, FiEye, FiFileText, FiLayout } from 'react-icons/fi';
import pb from '../../lib/pocketbase';

export default function AnalyticsOverview() {
  const [data, setData] = useState({
    posts: [],
    projects: [],
    stats: { totalViews: 0, topPost: '', topProject: '' }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        // En çok izlenen 5 blog yazısını getir
        const posts = await pb.collection('posts').getFullList({
          sort: '-views',
          fields: 'id,title,views'
        });

        // En çok izlenen 5 projeyi getir
        const projects = await pb.collection('projects').getFullList({
          sort: '-views',
          fields: 'id,title,views'
        });

        const totalViews = [...posts, ...projects].reduce((acc, curr) => acc + (curr.views || 0), 0);
        
        setData({
          posts: posts.slice(0, 5),
          projects: projects.slice(0, 5),
          stats: {
            totalViews,
            topPost: posts[0]?.title || '-',
            topProject: projects[0]?.title || '-'
          }
        });
      } catch (error) {
        console.error('Analitik yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const chartData = [
    ...data.posts.map(p => ({ name: p.title.substring(0, 15) + '...', views: p.views || 0, type: 'Blog' })),
    ...data.projects.map(p => ({ name: p.title.substring(0, 15) + '...', views: p.views || 0, type: 'Proje' }))
  ].sort((a, b) => b.views - a.views).slice(0, 8);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', fontSize: '0.8rem' }}>
          <p style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{payload[0].payload.name}</p>
          <p style={{ color: 'var(--accent)' }}>{payload[0].value} İzlenme</p>
          <p style={{ opacity: 0.6, fontSize: '0.7rem' }}>Kategori: {payload[0].payload.type}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) return <div style={{ padding: '2rem', opacity: 0.5 }}>Analizler yükleniyor...</div>;

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <header>
        <h2 style={{ fontSize: 'var(--h2-size)', fontWeight: 950, letterSpacing: '-1.5px', marginBottom: '0.5rem' }}>
          Performans Analizi
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>İçeriklerinin nasıl bir performans gösterdiğini buradan takip edebilirsin.</p>
      </header>

      {/* Stats Grid */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{ width: 50, height: 50, borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}><FiEye /></div>
          <div>
            <p style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: 700 }}>Toplam Görüntülenme</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 900 }}>{data.stats.totalViews}</h3>
          </div>
        </div>
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{ width: 50, height: 50, borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}><FiFileText /></div>
          <div>
            <p style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: 700 }}>En Popüler Yazı</p>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{data.stats.topPost}</h3>
          </div>
        </div>
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{ width: 50, height: 50, borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}><FiLayout /></div>
          <div>
            <p style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase', fontWeight: 700 }}>En Popüler Proje</p>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{data.stats.topProject}</h3>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass" style={{ padding: '2rem', borderRadius: '20px', minHeight: '400px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FiTrendingUp style={{ color: 'var(--accent)' }} /> En Çok İzlenen İçerikler
        </h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <Bar dataKey="views" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.type === 'Blog' ? 'var(--accent)' : 'var(--accent-blue)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
         <section className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
            <h4 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '0.95rem' }}>Popüler Blog Yazıları</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {data.posts.map((p, i) => (
                 <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.8 }}>{i+1}. {p.title}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)' }}>{p.views || 0}</span>
                 </div>
               ))}
            </div>
         </section>
         <section className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
            <h4 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '0.95rem' }}>Popüler Projeler</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {data.projects.map((p, i) => (
                 <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.8 }}>{i+1}. {p.title}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-blue)' }}>{p.views || 0}</span>
                 </div>
               ))}
            </div>
         </section>
      </div>
    </div>
  );
}
