'use client';
import { useState, useEffect } from 'react';
import { FiTrendingUp, FiLayers, FiFileText, FiEye, FiClock, FiSearch, FiLayout, FiX, FiCalendar, FiArrowRight, FiExternalLink } from 'react-icons/fi';
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

  const allPosts = data.posts.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allProjects = data.projects.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = [...allPosts, ...allProjects]
    .sort((a,b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10)
    .map(item => ({
      name: item.title.length > 20 ? item.title.substring(0, 20) + '...' : item.title,
      views: item.views || 0,
      type: data.posts.includes(item) ? 'Blog' : 'Proje',
      raw: item
    }));

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Analiz ediliyor...</div>;

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <header>
        <h2 style={{ fontSize: 'var(--h2-size)', fontWeight: 950, letterSpacing: '-1.5px', marginBottom: '0.5rem' }}>Analitik Merkezi</h2>
        <p style={{ color: 'var(--text-secondary)' }}>İçeriklerinin performansını ve etkileşim istatistiklerini buradan takip edebilirsin.</p>
      </header>

      {/* Grid Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <StatCard icon={<FiEye />} label="Toplam Görüntülenme" value={data.stats.totalViews} color="#3b82f6" />
        <StatCard icon={<FiFileText />} label="En Popüler Yazı" value={data.stats.topPost} color="#10b981" isTitle />
        <StatCard icon={<FiLayout />} label="En Popüler Proje" value={data.stats.topProject} color="#8b5cf6" isTitle />
      </div>

      {/* Performance Chart */}
      <div className="glass" style={{ padding: '2.5rem', borderRadius: '32px', minHeight: '450px', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.4)' }}>
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
            <BarChart data={chartData} margin={{ top: 10, right: isMobile ? 0 : 20, left: isMobile ? -35 : -10, bottom: 0 }} onClick={(e) => e?.activePayload?.[0]?.payload?.raw && setSelectedItem(e.activePayload[0].payload.raw)}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="views" radius={[6, 6, 0, 0]} barSize={isMobile ? 15 : 40}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.type === 'Blog' ? 'var(--accent)' : 'var(--accent-blue)'} 
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Selected Item Detail (Premium Overlay/Section) */}
      {selectedItem && (
        <div className="animate-slide-up" style={{ padding: '2rem', borderRadius: '32px', background: 'var(--accent-gradient)', color: '#fff', position: 'relative', boxShadow: '0 30px 60px rgba(124,58,237,0.3)', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)', pointerEvents: 'none' }} />
            <button onClick={() => setSelectedItem(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', zIndex: 10 }}><FiX /></button>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ width: 120, height: 120, borderRadius: '24px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedItem.image ? <img src={pb.files.getURL(selectedItem, selectedItem.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FiLayers size={40} opacity={0.5} />}
                </div>
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', letterSpacing: '1px' }}>{data.posts.includes(selectedItem) ? 'Blog Yazısı' : 'Proje'}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.8 }}>#{selectedItem.id}</span>
                    </div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 950, marginBottom: '1rem', letterSpacing: '-0.5px' }}>{selectedItem.title}</h3>
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiEye /> <span style={{ fontWeight: 800 }}>{selectedItem.views || 0}</span> <span style={{ opacity: 0.8, fontSize: '0.8rem' }}>Görüntülenme</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiCalendar /> <span style={{ fontWeight: 800 }}>{new Date(selectedItem.created).toLocaleDateString()}</span> <span style={{ opacity: 0.8, fontSize: '0.8rem' }}>Tarihi</span></div>
                    </div>
                </div>
                <div style={{ flexShrink: 0 }}>
                    <a href={`/${data.posts.includes(selectedItem) ? 'blog' : 'projects'}/${selectedItem.slug}`} target="_blank" className="glass" style={{ padding: '0.85rem 1.75rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '0.9rem', color: '#fff', background: 'rgba(0,0,0,0.1)' }}>Görüntüle <FiExternalLink /></a>
                </div>
            </div>
        </div>
      )}

      {/* All Content Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: (isMobile) ? '1fr' : '1fr 1fr', gap: '2rem' }}>
        <ContentList 
            title="Tüm Yazılar" 
            items={allPosts} 
            icon={<FiFileText color="var(--accent)" />} 
            onSelect={setSelectedItem} 
            selectedId={selectedItem?.id} 
        />
        <ContentList 
            title="Tüm Projeler" 
            items={allProjects} 
            icon={<FiLayers color="var(--accent-blue)" />} 
            onSelect={setSelectedItem} 
            selectedId={selectedItem?.id} 
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, isTitle }) {
    return (
        <div className="glass card-hover" style={{ padding: '1.75rem', borderRadius: '28px', display: 'flex', gap: '1.5rem', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '18px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>{icon}</div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1.25px', marginBottom: '0.25rem' }}>{label}</p>
            <h3 style={{ 
                fontSize: isTitle ? '1.15rem' : '2.25rem', 
                fontWeight: 950, 
                color: '#fff',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden'
            }}>{value}</h3>
          </div>
        </div>
    );
}

function ContentList({ title, items, icon, onSelect, selectedId }) {
    return (
        <div className="glass" style={{ padding: '2rem', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>{icon} {title}</h4>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.4, background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '6px' }}>{items.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }} className="custom-scrollbar">
               {items.map((item, i) => {
                 const isActive = selectedId === item.id;
                 return (
                    <div 
                        key={item.id} 
                        onClick={() => onSelect(item)}
                        className={`glass card-hover ${isActive ? 'active-gradient' : ''}`} 
                        style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '1.1rem 1.4rem', 
                            borderRadius: '18px', 
                            border: isActive ? 'none' : '1px solid rgba(255,255,255,0.02)', 
                            cursor: 'pointer', 
                            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                            background: isActive ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.01)'
                        }}
                    >
                        <div style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 900, opacity: isActive ? 1 : 0.3, width: '20px' }}>{i+1}</span>
                            <span style={{ fontSize: '0.92rem', fontWeight: isActive ? 800 : 600, color: isActive ? '#fff' : 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 900, color: isActive ? '#fff' : 'var(--accent)' }}>{item.views || 0}</span>
                            <FiArrowRight style={{ opacity: isActive ? 1 : 0, transform: isActive ? 'translateX(0)' : 'translateX(-10px)', transition: 'all 0.4s' }} />
                        </div>
                    </div>
                 );
               })}
               {items.length === 0 && <p style={{ opacity: 0.5, fontSize: '0.9rem', textAlign: 'center', padding: '3rem' }}>Henüz içerik bulunmuyor.</p>}
            </div>
        </div>
    );
}
