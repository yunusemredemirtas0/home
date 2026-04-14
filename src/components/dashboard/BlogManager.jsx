'use client';
import { useState, useEffect, Suspense } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiImage, FiArchive, FiCheckCircle, FiClock, FiMonitor, FiType, FiUploadCloud, FiX, FiCheck, FiInfo, FiFileText } from 'react-icons/fi';
import pb from '../../lib/pocketbase';
import dynamic from 'next/dynamic';
import { editorModules, editorFormats } from '../../lib/editorConfig';
import { useLanguage } from '../../contexts/LanguageContext';

const ReactQuill = dynamic(() => import('react-quill-new'), { 
    ssr: false,
    loading: () => <div style={{ height: '300px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>Loading Editor...</div>
});
import 'react-quill-new/dist/quill.snow.css';

export default function BlogManager() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(true); // Default to true for premium feel
  const [filter, setFilter] = useState('all'); 
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    category: '',
    status: 'draft',
    image: null,
    imagePreview: null
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia('(max-width: 1024px)').matches);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      let filterQuery = '';
      if (filter === 'published') filterQuery = 'status = "published"';
      if (filter === 'draft') filterQuery = 'status = "draft"';
      if (filter === 'archived') filterQuery = 'status = "archived"';

      const records = await pb.collection('posts').getFullList({
        expand: 'author',
        filter: filterQuery,
        sort: '-created'
      });
      setPosts(records || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
    setIsLoading(false);
  };

  const handleEdit = (post) => {
    if (!post) return;
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      slug: post.slug || '',
      content: post.content || '',
      category: post.category || '',
      status: post.status || 'draft',
      image: null,
      imagePreview: post.image ? pb.files.getURL(post, post.image) : null
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (postId) => {
    if (window.confirm(t?.dashboard?.actions?.delete + '?')) {
      try {
        await pb.collection('posts').delete(postId);
        setPosts(prev => prev.filter(p => p.id !== postId));
      } catch (error) {
        alert('Error.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pb.authStore.model) return;

    const data = new FormData();
    data.append('title', formData.title);
    data.append('slug', formData.slug || formData.title.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c'));
    data.append('content', formData.content);
    data.append('category', formData.category);
    data.append('status', formData.status);
    data.append('author', pb.authStore.model.id);
    
    if (formData.image) data.append('image', formData.image);

    try {
      if (editingPost) {
        await pb.collection('posts').update(editingPost.id, data);
      } else {
        await pb.collection('posts').create(data);
      }
      setIsFormOpen(false);
      setEditingPost(null);
      fetchPosts();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev, 
        image: file, 
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const statusOptions = [
    { value: 'draft', label: 'Draft', icon: <FiClock />, color: '#f59e0b' },
    { value: 'published', label: 'Published', icon: <FiCheck />, color: '#10b981' },
    { value: 'archived', label: 'Archived', icon: <FiArchive />, color: '#ef4444' }
  ];

  if (isFormOpen) {
    return (
      <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: (showPreview && !isMobile) ? '1.2fr 0.8fr' : '1fr', gap: '3rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
             <div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 950, letterSpacing: '-1px' }}>{editingPost ? 'Yazıyı Düzenle' : 'Yeni Blog Yazısı'}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>İçeriğini hazırla ve dünyayla paylaş.</p>
             </div>
             <button type="button" className="glass desktop-only" onClick={() => setShowPreview(!showPreview)} style={{ padding: '0.75rem 1.25rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>
                <FiMonitor /> {showPreview ? 'Önizlemeyi Kapat' : 'Canlı Önizleme'}
             </button>
          </header>

          <form onSubmit={handleSubmit}>
            {/* General Info Card */}
            <div className="form-group-card">
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                  <FiInfo color="var(--accent)" />
                  <h4 style={{ fontWeight: 800, fontSize: '1rem' }}>Genel Bilgiler</h4>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="form-label">Yazı Başlığı</label>
                    <div style={{ position: 'relative' }}>
                      <FiType style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                      <input type="text" value={formData.title} onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))} required className="form-input" style={{ paddingLeft: '2.8rem' }} placeholder="Etkileyici bir başlık girin..." />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="form-label">Durum</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                       {statusOptions.map(opt => (
                         <button 
                            key={opt.value} 
                            type="button" 
                            onClick={() => setFormData(prev => ({...prev, status: opt.value}))}
                            style={{ 
                              flex: 1, padding: '0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, 
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                              background: formData.status === opt.value ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.03)',
                              border: formData.status === opt.value ? 'none' : '1px solid rgba(255,255,255,0.05)',
                              color: formData.status === opt.value ? '#fff' : 'var(--text-secondary)',
                              transition: 'all 0.3s'
                            }}
                         >
                            {opt.icon} {opt.label}
                         </button>
                       ))}
                    </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem', gridColumn: '1 / -1' }}>
                    <label className="form-label">Kategori</label>
                    <input type="text" value={formData.category} onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))} placeholder="Örn: Teknoloji, Yaşam, Yazılım..." className="form-input" />
                  </div>
               </div>
            </div>

            {/* Media Card */}
            <div className="form-group-card">
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                  <FiImage color="var(--accent-blue)" />
                  <h4 style={{ fontWeight: 800, fontSize: '1rem' }}>Medya ve Kapak Resmi</h4>
               </div>
               <label className="drop-zone">
                  {formData.imagePreview && <div className="drop-zone-glow" />}
                  <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      {formData.imagePreview ? (
                        <div style={{ width: '100%', maxWidth: '200px', height: '120px', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--accent)' }}>
                           <img src={formData.imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <FiUploadCloud size={40} opacity={0.3} />
                      )}
                      <div style={{ textAlign: 'center' }}>
                         <p style={{ fontWeight: 800, marginBottom: '0.25rem' }}>{formData.imagePreview ? 'Resmi Değiştir' : 'Resim Yükle'}</p>
                         <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>JPG, PNG veya WebP en fazla 5MB.</p>
                      </div>
                  </div>
                  <input type="file" hidden onChange={handleImageChange} accept="image/*" />
               </label>
            </div>

            {/* Content Editor Card */}
            <div className="form-group-card">
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                  <FiPaperclip color="var(--accent)" />
                  <h4 style={{ fontWeight: 800, fontSize: '1rem' }}>Yazı İçeriği</h4>
               </div>
               <div className="rich-editor-container" style={{ minHeight: '450px' }}>
                  <Suspense fallback={<div>Loading editor...</div>}>
                     <ReactQuill 
                         theme="snow" 
                         value={formData.content} 
                         onChange={(val) => setFormData(prev => ({...prev, content: val}))} 
                         modules={editorModules}
                         formats={editorFormats}
                         style={{ height: isMobile ? '350px' : '400px' }} 
                     />
                  </Suspense>
               </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '4rem' }}>
               <button type="button" className="glass" onClick={() => setIsFormOpen(false)} style={{ padding: '1rem 2.5rem', borderRadius: '15px', fontWeight: 700, fontSize: '0.9rem' }}>Vazgeç</button>
               <button type="submit" className="btn-primary" style={{ padding: '1rem 3rem', borderRadius: '15px', fontWeight: 900, fontSize: '0.95rem' }}>
                  <FiSave style={{ marginRight: '0.75rem' }} /> {editingPost ? 'Değişiklikleri Kaydet' : 'Yazıyı Yayınla'}
               </button>
            </div>
          </form>
        </div>

        {/* Premium Preview Section */}
        {showPreview && (
          <div className="desktop-only" style={{ position: 'sticky', top: '6rem' }}>
             <div className="device-frame" style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                <div className="device-header">
                   <div className="device-dot" style={{ background: '#ff5f56' }} />
                   <div className="device-dot" style={{ background: '#ffbd2e' }} />
                   <div className="device-dot" style={{ background: '#27c93f' }} />
                   <div style={{ marginLeft: '1rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>PREVIEW MODE</div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem' }} className="custom-scrollbar">
                   {formData.imagePreview && (
                     <div style={{ width: '100%', height: '220px', borderRadius: '18px', overflow: 'hidden', marginBottom: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                        <img src={formData.imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     </div>
                   )}
                   <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{formData.category || 'GENEL'}</span>
                   <h1 style={{ fontSize: '2.25rem', fontWeight: 950, marginBottom: '1.5rem', lineHeight: 1.1, marginTop: '0.5rem' }}>{formData.title || 'Yazı Başlığı...'}</h1>
                   <div style={{ width: '40px', height: '4px', background: 'var(--accent)', borderRadius: '2px', marginBottom: '2rem' }} />
                   <div dangerouslySetInnerHTML={{ __html: formData.content }} className="rich-text-content premium-rich-text" />
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: 'var(--h2-size)', fontWeight: 950, letterSpacing: '-1.5px' }}>Blog Yönetimi</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Toplam {posts.length} yazı bulunmaktadır.</p>
        </div>
        <button onClick={() => { setEditingPost(null); setFormData({ title: '', slug: '', content: '', category: '', status: 'draft', image: null, imagePreview: null }); setIsFormOpen(true); }} className="btn-primary" style={{ padding: '0.8rem 1.75rem', borderRadius: '15px' }}>
          <FiPlus /> Yeni Yazı Ekle
        </button>
      </header>

      {/* List Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {['all', 'published', 'draft', 'archived'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className="glass" style={{ padding: '0.6rem 1.25rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800, background: filter === f ? 'var(--accent-gradient)' : 'transparent', border: '1px solid var(--glass-border)', color: filter === f ? '#fff' : 'var(--text-secondary)' }}>
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {isLoading ? (
          <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>Yükleniyor...</div>
        ) : posts.length === 0 ? (
          <div className="glass" style={{ padding: '5rem', textAlign: 'center', borderRadius: '32px', border: '1px solid var(--glass-border)', borderStyle: 'dashed' }}>
             <p style={{ opacity: 0.5 }}>Seçili kriterlere uygun yazı bulunamadı.</p>
          </div>
        ) : posts.map(post => {
           const status = statusOptions.find(o => o.value === post.status) || statusOptions[0];
           return (
            <div key={post.id} className="glass card-hover" style={{ padding: '1.25rem 2.5rem', borderRadius: '24px', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flex: '1 1 300px' }}>
                <div style={{ position: 'relative', width: 64, height: 64, borderRadius: '16px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)' }}>
                  {post.image ? <img src={pb.files.getURL(post, post.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FiFileText size={24} style={{ margin: '20px', opacity: 0.2 }} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>{post.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', fontWeight: 700 }}>
                     <span style={{ color: status.color, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>{status.icon} {status.label}</span>
                     <span style={{ opacity: 0.3 }}>•</span>
                     <span style={{ color: 'var(--text-secondary)' }}>{post.category || 'General'}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                 <button onClick={() => handleEdit(post)} className="glass" style={{ width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}><FiEdit2 /></button>
                 {post.status !== 'archived' && <button onClick={() => pb.collection('posts').update(post.id, { status: 'archived' }).then(() => fetchPosts())} className="glass" style={{ width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}><FiArchive /></button>}
                 <button onClick={() => handleDelete(post.id)} className="glass" style={{ width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error)' }}><FiTrash2 /></button>
              </div>
            </div>
           );
        })}
      </div>
    </div>
  );
}
