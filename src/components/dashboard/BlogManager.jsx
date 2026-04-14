'use client';
import { useState, useEffect, useRef } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiImage, FiArchive, FiClock, FiMonitor, FiType, FiUploadCloud, FiX, FiCheck, FiInfo, FiFileText, FiPaperclip } from 'react-icons/fi';
import pb from '../../lib/pocketbase';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div style={{ height: '300px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Editor yükleniyor...</div>
});
import 'react-quill-new/dist/quill.snow.css';

export default function BlogManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showPreview, setShowPreview] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    status: 'draft',
    image: null,
    imagePreview: null
  });

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  async function fetchPosts() {
    setLoading(true);
    try {
      // Data Recovery Fix: Disable auto-cancellation and remove strict filters
      pb.autoCancellation(false);
      
      // We fetch ALL records and filter in JS to bypass possible API Rule restrictions 
      // or field invisibility (like 'created' sort failure).
      const records = await pb.collection('posts').getFullList({
        sort: '-id', // Sort by ID as a safer alternative to 'created'
        requestKey: 'fetch_blogs_' + Date.now() // Cache-busting
      });
      
      console.log('--- BLOG DATA DEBUG ---');
      console.log('Total Records:', records.length);
      if (records.length > 0) console.table(records.slice(0, 3)); 
      
      setPosts(records || []);
    } catch (error) {
      console.error('Blog fetch critical error:', error);
    } finally {
      setLoading(false);
    }
  }

  // Client-side filtering logic for display
  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    return post.status === filter;
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ 
        ...prev, 
        image: file, 
        imagePreview: URL.createObjectURL(file) 
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'image' && typeof formData[key] === 'string') return;
      if (formData[key]) data.append(key, formData[key]);
    });

    try {
      if (editingId) {
        await pb.collection('posts').update(editingId, data);
      } else {
        await pb.collection('posts').create(data);
      }
      setIsFormOpen(false);
      resetForm();
      fetchPosts();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Hata: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', slug: '', excerpt: '', content: '', category: '', status: 'draft', image: null, imagePreview: null });
    setEditingId(null);
  };

  const handleEdit = (post) => {
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category || '',
      status: post.status,
      image: post.image,
      imagePreview: post.image ? pb.files.getURL(post, post.image) : null
    });
    setEditingId(post.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu yazıyı silmek istediğine emin misin?')) {
      await pb.collection('posts').delete(id);
      fetchPosts();
    }
  }

  const statusOptions = [
    { value: 'draft', label: 'Taslak', icon: <FiClock />, color: '#f59e0b' },
    { value: 'published', label: 'Yayında', icon: <FiCheck />, color: '#10b981' },
    { value: 'archived', label: 'Arşiv', icon: <FiArchive />, color: '#ef4444' }
  ];

  if (isFormOpen) {
    return (
      <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900 }}>{editingId ? 'Yazıyı Düzenle' : 'Yeni Yazı Ekle'}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>İçeriğini hazırla ve önizlemeden kontrol et.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setShowPreview(!showPreview)} className="glass" style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
              <FiMonitor /> {showPreview ? 'Önizlemeyi Kapat' : 'Önizlemeyi Aç'}
            </button>
            <button onClick={() => { setIsFormOpen(false); resetForm(); }} className="glass" style={{ width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error)' }}><FiX /></button>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: showPreview ? '1.2fr 1fr' : '1fr', gap: '3rem', alignItems: 'start', position: 'relative' }}>
          {/* Editor Column */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group-card">
               <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="input-group">
                    <label className="form-label">Başlık</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))} className="form-input" placeholder="Yazı başlığı..." required />
                  </div>
                  <div className="input-group">
                    <label className="form-label">Durum</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                       {statusOptions.map(opt => (
                         <button key={opt.value} type="button" onClick={() => setFormData(prev => ({...prev, status: opt.value}))} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', background: formData.status === opt.value ? opt.color : 'rgba(255,255,255,0.03)', border: '1px solid', borderColor: formData.status === opt.value ? opt.color : 'var(--glass-border)', color: formData.status === opt.value ? '#fff' : 'var(--text-secondary)', transition: 'all 0.3s' }}>{opt.icon}</button>
                       ))}
                    </div>
                  </div>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="input-group">
                    <label className="form-label">Slug</label>
                    <input type="text" value={formData.slug} onChange={(e) => setFormData(prev => ({...prev, slug: e.target.value}))} className="form-input" placeholder="yazi-url-adresi" required />
                  </div>
                  <div className="input-group">
                    <label className="form-label">Kategori</label>
                    <input type="text" value={formData.category} onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))} className="form-input" placeholder="Örn: Teknoloji" />
                  </div>
               </div>

               <div className="input-group">
                  <label className="form-label">Kısa Özet</label>
                  <textarea value={formData.excerpt} onChange={(e) => setFormData(prev => ({...prev, excerpt: e.target.value}))} className="form-input" style={{ minHeight: '80px', resize: 'vertical' }} placeholder="Okuyucuyu etkileyecek kısa bir cümle..." />
               </div>
            </div>

            <div className="form-group-card">
              <label className="form-label" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiType style={{ color: 'var(--accent)' }}/> İçerik Editörü</label>
              <ReactQuill 
                theme="snow" 
                value={formData.content} 
                onChange={(val) => setFormData(prev => ({...prev, content: val}))} 
                style={{ height: '400px', marginBottom: '3rem' }}
              />
            </div>

            <div className="form-group-card">
               <label className="form-label"><FiImage style={{ color: 'var(--accent)' }}/> Kapak Görseli</label>
               <div className="drop-zone" onClick={() => document.getElementById('imageInput').click()}>
                  {formData.imagePreview ? (
                    <img src={formData.imagePreview} style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px' }} />
                  ) : (
                    <>
                      <FiUploadCloud size={40} opacity={0.3} />
                      <p style={{ fontSize: '0.9rem', opacity: 0.5 }}>Görsel yüklemek için tıkla veya sürükle</p>
                    </>
                  )}
                  <input id="imageInput" type="file" hidden onChange={handleImageChange} accept="image/*" />
               </div>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '1.25rem', fontSize: '1.1rem', borderRadius: '18px', boxShadow: '0 20px 40px rgba(124,58,237,0.3)' }}>
              <FiSave /> {editingId ? 'Değişiklikleri Kaydet' : 'Yazıyı Yayınla'}
            </button>
          </form>

          {/* Centered Sticky Preview Column (v4) */}
          {showPreview && (
            <div className="desktop-only sticky-center" style={{ width: '100%' }}>
              <div className="device-frame shadow-2xl" style={{ border: '8px solid #1a1a1a', borderRadius: '32px' }}>
                <div className="device-header">
                  <div className="device-dot" style={{ background: '#ff5f56' }} />
                  <div className="device-dot" style={{ background: '#ffbd2e' }} />
                  <div className="device-dot" style={{ background: '#27c93f' }} />
                  <div style={{ marginLeft: 'auto', fontSize: '0.65rem', opacity: 0.4, fontWeight: 800, letterSpacing: '1px' }}>BLOG PREVIEW</div>
                </div>
                <div className="custom-scrollbar" style={{ height: '70vh', overflowY: 'auto', background: 'var(--bg-color)', padding: '2rem' }}>
                  {formData.imagePreview && <img src={formData.imagePreview} style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '20px', marginBottom: '2rem' }} />}
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '2px' }}>{formData.category || 'Kategori'}</span>
                  <h1 style={{ fontSize: '2.5rem', fontWeight: 950, margin: '1rem 0', lineHeight: 1.1, letterSpacing: '-1.5px' }}>{formData.title || 'Yazı Başlığı'}</h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0', opacity: 0.6, fontSize: '0.85rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-gradient)' }} />
                    <span>Yunus Emre Demirtaş</span>
                    <span>•</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="premium-rich-text custom-quill-content" dangerouslySetInnerHTML={{ __html: formData.content }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 950, letterSpacing: '-1.5px' }}>Blog Yönetimi</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Yazılarını oluştur, düzenle ve performanslarını takip et.</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="btn-primary" style={{ padding: '0.85rem 1.75rem', borderRadius: '15px' }}>
          <FiPlus /> Yeni Yazı Ekle
        </button>
      </header>

      <div className="glass" style={{ padding: '0.5rem', borderRadius: '20px', display: 'flex', gap: '0.5rem', width: 'fit-content' }}>
        {['all', 'published', 'draft', 'archived'].map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{ padding: '0.6rem 1.5rem', borderRadius: '15px', fontSize: '0.85rem', fontWeight: 800, textTransform: 'capitalize', background: filter === t ? 'var(--accent-gradient)' : 'transparent', color: filter === t ? '#fff' : 'var(--text-secondary)', transition: 'all 0.3s' }}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '5rem', textAlign: 'center' }}>Yazılar yükleniyor...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {filteredPosts.map(post => {
            const status = statusOptions.find(o => o.value === post.status) || statusOptions[0];
            return (
              <div key={post.id} className="glass card-hover" style={{ borderRadius: '28px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: '180px' }}>
                  <img src={post.image ? pb.files.getURL(post, post.image) : '/blog-placeholder.jpg'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.5rem 1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 800, color: status.color }}>
                    {status.icon} {status.label}
                  </div>
                </div>
                <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '1px' }}>{post.category || 'Genel'}</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.75rem 0', lineHeight: 1.3 }}>{post.title}</h3>
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEdit(post)} className="glass" style={{ width: 38, height: 38, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}><FiEdit2 size={16}/></button>
                      <button onClick={() => handleDelete(post.id)} className="glass" style={{ width: 38, height: 38, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error)' }}><FiTrash2 size={16}/></button>
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.5, fontWeight: 700 }}>{post.created ? new Date(post.created).toLocaleDateString() : 'Bilinmiyor'}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!loading && filteredPosts.length === 0 && (
         <div className="glass" style={{ padding: '5rem', textAlign: 'center', borderRadius: '32px' }}>
            <FiFileText size={48} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
            <p style={{ opacity: 0.5, fontWeight: 600 }}>Aradığın kriterlere uygun yazı bulunamadı.</p>
         </div>
      )}
    </div>
  );
}
