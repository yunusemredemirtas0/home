'use client';
import { useState, useEffect } from 'react';
import { FiSave, FiSearch, FiInfo, FiHash, FiLayout, FiFileText, FiFilter, FiCheckCircle } from 'react-icons/fi';
import pb from '../../lib/pocketbase';

export default function SEOManager() {
  const [activeTab, setActiveTab] = useState('pages');
  const [contentTypeFilter, setContentTypeFilter] = useState('all'); // all, posts, projects
  const [pages, setPages] = useState([]);
  const [content, setContent] = useState({ posts: [], projects: [] });
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const defaultPages = [
    { page_path: '/', name: 'Ana Sayfa' },
    { page_path: '/blog', name: 'Blog Listesi' },
    { page_path: '/projects', name: 'Projeler Listesi' }
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const [seoRecords, posts, projects] = await Promise.all([
          pb.collection('seo_settings').getFullList(),
          pb.collection('posts').getFullList({ sort: '-created' }),
          pb.collection('projects').getFullList({ sort: '-created' })
        ]);
        
        const mergedPages = defaultPages.map(dp => {
            const existing = seoRecords.find(r => r.page_path === dp.page_path);
            return existing || { ...dp, title: '', description: '', keywords: '', isNew: true };
        });
        
        setPages(mergedPages);
        setContent({ posts, projects });
      } catch (error) {
        console.error('SEO veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handlePageChange = (index, field, value) => {
    const newPages = [...pages];
    newPages[index][field] = value;
    setPages(newPages);
  };

  const handleContentChange = (type, id, field, value) => {
    const newContent = { ...content };
    const index = newContent[type].findIndex(item => item.id === id);
    if (index !== -1) {
      newContent[type][index][field] = value;
      setContent(newContent);
    }
  };

  const savePageSEO = async (index) => {
    const page = pages[index];
    setSavingId(page.page_path);
    try {
      const data = { page_path: page.page_path, title: page.title, description: page.description, keywords: page.keywords };
      if (page.id) await pb.collection('seo_settings').update(page.id, data);
      else {
        const record = await pb.collection('seo_settings').create(data);
        const newPages = [...pages];
        newPages[index] = record;
        setPages(newPages);
      }
      alert(`${page.name} SEO ayarları güncellendi.`);
    } catch (e) { alert('Hata: ' + e.message); }
    finally { setSavingId(null); }
  };

  const saveContentSEO = async (type, id) => {
    const item = content[type].find(i => i.id === id);
    setSavingId(id);
    try {
      const data = {
        seo_title: item.seo_title,
        seo_description: item.seo_description,
        seo_keywords: item.seo_keywords
      };
      await pb.collection(type).update(id, data);
      alert('İçerik SEO ayarları güncellendi.');
    } catch (e) { alert('Hata: ' + e.message); }
    finally { setSavingId(null); }
  };

  // Filtreleme mantığı
  const filteredItems = [
    ...(contentTypeFilter === 'all' || contentTypeFilter === 'posts' ? content.posts.map(p => ({ ...p, type: 'posts', typeLabel: 'Blog' })) : []),
    ...(contentTypeFilter === 'all' || contentTypeFilter === 'projects' ? content.projects.map(p => ({ ...p, type: 'projects', typeLabel: 'Proje' })) : [])
  ].filter(item => {
    const title = item.title || '';
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a,b) => new Date(b.created) - new Date(a.created));

  if (loading) return <div style={{ padding: '2rem', opacity: 0.5 }}>SEO verileri yükleniyor...</div>;

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: 'var(--h2-size)', fontWeight: 950, letterSpacing: '-1.5px', marginBottom: '0.5rem' }}>
            SEO Kontrol Paneli
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Sitenin Google sonuçlarındaki görünümünü buradan yönetebilirsin.</p>
        </div>

        <div className="glass" style={{ display: 'flex', padding: '0.4rem', borderRadius: '14px', gap: '0.25rem' }}>
           <button onClick={() => setActiveTab('pages')} style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, background: activeTab === 'pages' ? 'var(--accent-gradient)' : 'transparent', color: activeTab === 'pages' ? '#fff' : 'var(--text-secondary)', transition: 'all 0.3s' }}>Sabit Sayfalar</button>
           <button onClick={() => setActiveTab('content')} style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, background: activeTab === 'content' ? 'var(--accent-gradient)' : 'transparent', color: activeTab === 'content' ? '#fff' : 'var(--text-secondary)', transition: 'all 0.3s' }}>İçerik SEO (Blog/Proje)</button>
        </div>
      </header>

      {activeTab === 'pages' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {pages.map((page, index) => (
            <SEOCard 
              key={page.page_path}
              titleLabel={page.name}
              subtitle={page.page_path}
              data={{ title: page.title, description: page.description, keywords: page.keywords }}
              onToggle={(field, val) => handlePageChange(index, field, val)}
              onSave={() => savePageSEO(index)}
              isSaving={savingId === page.page_path}
              path={page.page_path}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
           {/* Filters & Search Bar */}
           <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="glass" style={{ flex: 1, minWidth: '300px', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0 1.5rem', borderRadius: '16px' }}>
                <FiSearch style={{ opacity: 0.4 }} />
                <input 
                  type="text" 
                  placeholder="Yazı veya proje başlığına göre ara..." 
                  className="form-input" 
                  style={{ border: 'none', background: 'transparent' }}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <FilterTag active={contentTypeFilter === 'all'} label="Hepsi" onClick={() => setContentTypeFilter('all')} />
                  <FilterTag active={contentTypeFilter === 'posts'} label="Blog" onClick={() => setContentTypeFilter('posts')} icon={<FiFileText />} />
                  <FilterTag active={contentTypeFilter === 'projects'} label="Proje" onClick={() => setContentTypeFilter('projects')} icon={<FiLayout />} />
              </div>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {filteredItems.slice(0, 8).map((item) => (
                <SEOCard 
                  key={item.id}
                  titleLabel={item.title}
                  subtitle={item.typeLabel}
                  data={{ title: item.seo_title, description: item.seo_description, keywords: item.seo_keywords }}
                  onToggle={(field, val) => handleContentChange(item.type, item.id, field, val)}
                  onSave={() => saveContentSEO(item.type, item.id)}
                  isSaving={savingId === item.id}
                  path={`/${item.type === 'posts' ? 'blog' : 'projects'}/${item.slug}`}
                />
              ))}
              {filteredItems.length === 0 && (
                <div className="glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: '24px' }}>
                   <p style={{ opacity: 0.5 }}>Aranılan kriterlere uygun içerik bulunamadı.</p>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
}

function FilterTag({ active, label, onClick, icon }) {
  return (
    <button 
      onClick={onClick}
      className="glass"
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        padding: '0.6rem 1.25rem', 
        borderRadius: '12px', 
        fontSize: '0.85rem', 
        fontWeight: 700,
        border: active ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
        background: active ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        transition: 'all 0.2s',
        cursor: 'pointer'
      }}
    >
      {icon} {label}
    </button>
  );
}

function SEOCard({ titleLabel, subtitle, data, onToggle, onSave, isSaving, path }) {
  return (
    <div className="glass" style={{ padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
         <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
           <FiSearch style={{ color: 'var(--accent)' }} /> {titleLabel} <span style={{ fontSize: '0.8rem', opacity: 0.4, fontWeight: 500 }}>({subtitle})</span>
         </h3>
         <button 
          onClick={onSave} 
          disabled={isSaving}
          className="btn-primary" 
          style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}
         >
           {isSaving ? 'Kaydediliyor...' : <><FiSave style={{ marginRight: '0.5rem' }} /> Değişiklikleri Kaydet</>}
         </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <SEOInput label="Meta Başlık" value={data.title} onChange={v => onToggle('title', v) || onToggle('seo_title', v)} placeholder="Google başlığı..." />
        <SEOInput label="Meta Açıklama" value={data.description} onChange={v => onToggle('description', v) || onToggle('seo_description', v)} placeholder="Tanıtım yazısı..." isTextArea />
        <SEOInput label="Anahtar Kelimeler" value={data.keywords} onChange={v => onToggle('keywords', v) || onToggle('seo_keywords', v)} placeholder="Örn: teknoloji, yazılım..." />
      </div>

      <div style={{ marginTop: '2.5rem', padding: '1.5rem', borderRadius: '12px', background: '#fff', color: '#1a0dab', fontSize: '0.9rem', border: '1px solid #dfe1e5' }}>
         <p style={{ color: '#202124', fontSize: '0.75rem', marginBottom: '0.25rem' }}>https://yunusemredemirtas.com{path === '/' ? '' : path}</p>
         <h4 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: '#1a0dab', fontWeight: 400 }}>{data.title || 'Sitenin Başlığı Burada Görünecek'}</h4>
         <p style={{ color: '#4d5156', lineHeight: 1.5 }}>{data.description || 'Google arama sonuçlarındaki açıklama burada yer alacak.'}</p>
      </div>
    </div>
  );
}

function SEOInput({ label, value, onChange, placeholder, isTextArea }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiInfo size={14} /> {label}</label>
      {isTextArea ? (
        <textarea rows={3} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="form-input" />
      ) : (
        <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="form-input" />
      )}
    </div>
  );
}
