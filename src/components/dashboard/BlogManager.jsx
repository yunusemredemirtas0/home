'use client';
import { useState, useEffect, Suspense } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiImage, FiDownload, FiEye, FiArchive, FiCheckCircle, FiClock } from 'react-icons/fi';
import pb from '../../lib/pocketbase';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill-new'), { 
    ssr: false,
    loading: () => <div style={{ height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Düzenleyici yükleniyor...</div>
});
import 'react-quill-new/dist/quill.snow.css';

export default function BlogManager() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all, published, draft, archived
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    category: '',
    status: 'draft',
    image: null
  });

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
        filter: filterQuery
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
      image: null
    });
    setIsFormOpen(true);
  };

  const handleArchive = async (post) => {
    if (window.confirm('Bu yazıyı arşivlemek istediğinize emin misiniz? Siteden kaldırılacak ama burada saklanacak.')) {
      try {
        await pb.collection('posts').update(post.id, { status: 'archived' });
        fetchPosts();
      } catch (error) {
        alert('Arşivleme hatası.');
      }
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('DİKKAT: Bu yazıyı KALICI olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        await pb.collection('posts').delete(postId);
        setPosts(prev => prev.filter(p => p.id !== postId));
      } catch (error) {
        alert('Silme hatası.');
      }
    }
  };

  const downloadBackup = (post) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(post, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `blog-yedek-${post.slug || post.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pb.authStore.model) return;

    const data = new FormData();
    data.append('title', formData.title);
    data.append('slug', formData.slug || formData.title.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
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
      alert('Hata: ' + error.message);
    }
  };

  const statusIcons = {
    published: <FiCheckCircle style={{ color: '#10b981' }} />,
    draft: <FiClock style={{ color: '#f59e0b' }} />,
    archived: <FiArchive style={{ color: '#ef4444' }} />
  };

  return (
    <div className="animate-fade">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-1.5px', marginBottom: '0.5rem' }}>Blog Yönetimi</h2>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
             {['all', 'published', 'draft', 'archived'].map(f => (
               <button 
                key={f}
                onClick={() => setFilter(f)}
                style={{ 
                  padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                  background: filter === f ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.05)',
                  color: filter === f ? '#fff' : 'var(--text-secondary)',
                  border: 'none', cursor: 'pointer'
                }}
               >
                 {f === 'all' ? 'Hepsi' : f === 'published' ? 'Yayınlananlar' : f === 'draft' ? 'Taslaklar' : 'Arşivdekiler'}
               </button>
             ))}
          </div>
        </div>
        {!isFormOpen && (
          <button onClick={() => { setEditingPost(null); setFormData({ title: '', slug: '', content: '', category: '', status: 'draft', image: null }); setIsFormOpen(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.75rem' }}>
            <FiPlus /> Yeni Yazı Ekle
          </button>
        )}
      </header>

      {isFormOpen ? (
        <form onSubmit={handleSubmit} className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Başlık</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))} required className="form-input" style={{ width: '100%' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Yayın Durumu</label>
              <select 
                value={formData.status} 
                onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
                style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#fff', cursor: 'pointer' }}
              >
                <option value="draft" style={{ background: '#1a1a1a' }}>📝 Taslak</option>
                <option value="published" style={{ background: '#1a1a1a' }}>🚀 Yayınla</option>
                <option value="archived" style={{ background: '#1a1a1a' }}>🗄️ Arşivle</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Kategori</label>
              <input type="text" value={formData.category} onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))} className="form-input" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Kapak Görseli</label>
              <label className="glass" style={{ padding: '0.85rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', borderStyle: 'dashed' }}>
                <FiImage /> {formData.image ? formData.image.name : 'Görsel Seç'}
                <input type="file" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) setFormData(prev => ({...prev, image: f})); }} />
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '3.5rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>İçerik</label>
            <div className="rich-editor" style={{ color: '#000' }}>
               <Suspense fallback={<div>Düzenleyici yükleniyor...</div>}>
                  <ReactQuill theme="snow" value={formData.content} onChange={(val) => setFormData(prev => ({...prev, content: val}))} style={{ height: '350px', marginBottom: '50px', background: '#fff', borderRadius: '12px', overflow: 'hidden' }} />
               </Suspense>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
             <button type="button" onClick={() => setIsFormOpen(false)} style={{ padding: '1rem 2rem', borderRadius: '10px', fontWeight: 600 }}>İptal</button>
             <button type="submit" className="btn-primary" style={{ padding: '1rem 2.5rem' }}>
                <FiSave style={{ marginRight: '0.5rem' }} /> {editingPost ? 'Değişiklikleri Kaydet' : 'Yayınla'}
             </button>
          </div>
        </form>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {isLoading ? <p>Yükleniyor...</p> : posts.length === 0 ? (
            <div className="glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: 'var(--radius-xl)', borderStyle: 'dashed' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Bu filtreyle eşleşen yazı bulunamadı.</p>
            </div>
          ) : posts.map(post => (
              <div key={post.id} className="glass card-hover" style={{ padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flex: 1 }}>
                  <div style={{ position: 'relative' }}>
                    {post.image ? <img src={pb.files.getURL(post, post.image)} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '8px' }} /> : <div style={{ width: 60, height: 60, borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }} />}
                    <div style={{ position: 'absolute', top: -10, right: -10, background: 'var(--bg-color)', border: '1px solid var(--glass-border)', padding: '4px', borderRadius: '50%', display: 'flex' }}>{statusIcons[post.status || 'draft']}</div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{post.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{post.category || 'Genel'} • {post.created ? new Date(post.created.substring(0, 10)).toLocaleDateString() : ''}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button title="Yedek İndir" onClick={() => downloadBackup(post)} style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'none', cursor: 'pointer' }}><FiDownload /></button>
                  <button title="Düzenle" onClick={() => handleEdit(post)} style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}><FiEdit2 /></button>
                  {post.status !== 'archived' && <button title="Arşivle" onClick={() => handleArchive(post)} style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: 'none', cursor: 'pointer' }}><FiArchive /></button>}
                  <button title="Kalıcı Sil" onClick={() => handleDelete(post.id)} style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: 'none', cursor: 'pointer' }}><FiTrash2 /></button>
                </div>
              </div>
          ))}
        </div>
      )}
    </div>
  );
}
