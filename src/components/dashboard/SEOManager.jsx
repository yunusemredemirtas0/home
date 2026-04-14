'use client';
import { useState, useEffect } from 'react';
import { FiSave, FiSearch, FiInfo, FiHash } from 'react-icons/fi';
import pb from '../../lib/pocketbase';

export default function SEOManager() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const defaultPages = [
    { page_path: '/', name: 'Ana Sayfa' },
    { page_path: '/blog', name: 'Blog Listesi' },
    { page_path: '/projects', name: 'Projeler Listesi' }
  ];

  useEffect(() => {
    async function fetchSEO() {
      try {
        const records = await pb.collection('seo_settings').getFullList();
        
        // Veri tabanındaki kayıtlar ile varsayılan sayfaları eşleştirelim
        const mergedPages = defaultPages.map(dp => {
            const existing = records.find(r => r.page_path === dp.page_path);
            return existing || { ...dp, title: '', description: '', keywords: '', isNew: true };
        });
        
        setPages(mergedPages);
      } catch (error) {
        console.error('SEO yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSEO();
  }, []);

  const handleChange = (index, field, value) => {
    const newPages = [...pages];
    newPages[index][field] = value;
    setPages(newPages);
  };

  const handleSave = async (index) => {
    const page = pages[index];
    setSavingId(page.page_path);
    
    try {
      const data = {
        page_path: page.page_path,
        title: page.title,
        description: page.description,
        keywords: page.keywords
      };

      if (page.id) {
        await pb.collection('seo_settings').update(page.id, data);
      } else {
        const record = await pb.collection('seo_settings').create(data);
        const newPages = [...pages];
        newPages[index] = record;
        setPages(newPages);
      }
      alert(`${page.name} SEO ayarları güncellendi.`);
    } catch (error) {
      alert('Hata: ' + error.message);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <div style={{ padding: '2rem', opacity: 0.5 }}>SEO ayarları yükleniyor...</div>;

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <header>
        <h2 style={{ fontSize: 'var(--h2-size)', fontWeight: 950, letterSpacing: '-1.5px', marginBottom: '0.5rem' }}>
          SEO Kontrol Paneli
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>Sitenin Google arama sonuçlarındaki görünümünü buradan her sayfa için ayrı ayrı yönetebilirsin.</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {pages.map((page, index) => (
          <div key={page.page_path} className="glass" style={{ padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
               <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                 <FiSearch style={{ color: 'var(--accent)' }} /> {page.name} <span style={{ fontSize: '0.8rem', opacity: 0.4, fontWeight: 500 }}>({page.page_path})</span>
               </h3>
               <button 
                onClick={() => handleSave(index)} 
                disabled={savingId === page.page_path}
                className="btn-primary" 
                style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}
               >
                 {savingId === page.page_path ? 'Kaydediliyor...' : <><FiSave style={{ marginRight: '0.5rem' }} /> Değişiklikleri Kaydet</>}
               </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiInfo size={14} /> Meta Başlık (Meta Title)</label>
                <input 
                  type="text" 
                  value={page.title || ''} 
                  onChange={(e) => handleChange(index, 'title', e.target.value)}
                  placeholder="Google'da görünecek başlık..." 
                  className="form-input" 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiInfo size={14} /> Meta Açıklama (Meta Description)</label>
                <textarea 
                  rows={3}
                  value={page.description || ''} 
                  onChange={(e) => handleChange(index, 'description', e.target.value)}
                  placeholder="Sitenle ilgili kısa, çekici bir tanıtım yazısı..." 
                  className="form-input" 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiHash size={14} /> Anahtar Kelimeler (Keywords)</label>
                <input 
                  type="text" 
                  value={page.keywords || ''} 
                  onChange={(e) => handleChange(index, 'keywords', e.target.value)}
                  placeholder="Örn: web tasarım, yazılım, mobil uygulama..." 
                  className="form-input" 
                />
              </div>
            </div>

            {/* Google Preview Simulation */}
            <div style={{ marginTop: '2.5rem', padding: '1.5rem', borderRadius: '12px', background: '#fff', color: '#1a0dab', fontSize: '0.9rem', border: '1px solid #dfe1e5' }}>
               <p style={{ color: '#202124', fontSize: '0.75rem', marginBottom: '0.25rem' }}>https://yunusemredemirtas.com{page.page_path === '/' ? '' : page.page_path}</p>
               <h4 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: '#1a0dab', textDecoration: 'none', fontWeight: 400 }}>{page.title || 'Sitenin Başlığı Burada Görünecek'}</h4>
               <p style={{ color: '#4d5156', lineHeight: 1.5 }}>{page.description || 'Sitenin Google arama sonuçlarındaki açıklaması burada yer alacak. Profesyonel bir görünüm için bu alanı doldurmalısın.'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
