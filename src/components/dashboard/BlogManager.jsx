'use client';
import { useState, useEffect, Suspense } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiImage } from 'react-icons/fi';
import pb from '../../lib/pocketbase';
import dynamic from 'next/dynamic';

// Dynamic import with better error handling and modern library
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
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    category: '',
    image: null
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection('posts').getFullList({
        sort: '-created',
        expand: 'author'
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
      image: null
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (postId) => {
    if (!postId) return;
    if (window.confirm('Bu yazıyı silmek istediğinize emin misiniz?')) {
      try {
        await pb.collection('posts').delete(postId);
        setPosts(prev => prev.filter(p => p.id !== postId));
      } catch (error) {
        alert('Silme işlemi sırasında bir hata oluştu.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!pb.authStore.model) {
      alert('Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapın.');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('slug', formData.slug || formData.title.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
    data.append('content', formData.content);
    data.append('category', formData.category);
    data.append('author', pb.authStore.model.id);
    
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      if (editingPost) {
        await pb.collection('posts').update(editingPost.id, data);
      } else {
        await pb.collection('posts').create(data);
      }
      setIsFormOpen(false);
      setEditingPost(null);
      setFormData({ title: '', slug: '', content: '', category: '', image: null });
      fetchPosts();
    } catch (error) {
      alert('Kaydetme hatası: ' + error.message);
    }
  };

  return (
    <div className="animate-fade">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-1.5px', marginBottom: '0.5rem' }}>Blog Yönetimi</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Yazılarını oluştur, düzenle ve yayınla.</p>
        </div>
        {!isFormOpen && (
          <button 
            onClick={() => { 
                setEditingPost(null);
                setFormData({ title: '', slug: '', content: '', category: '', image: null });
                setIsFormOpen(true); 
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.5rem', borderRadius: '12px', background: 'var(--accent-gradient)', color: '#fff', fontWeight: 700, boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.5)' }}
          >
            <FiPlus /> Yeni Yazı Ekle
          </button>
        )}
      </header>

      {isFormOpen ? (
        <form onSubmit={handleSubmit} className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Başlık</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                required
                placeholder="Yazı başlığı..."
                style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'inherit' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Kategori</label>
              <input 
                type="text" 
                value={formData.category}
                onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                placeholder="Örn: Teknoloji, SEO"
                style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'inherit' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Kapak Görseli</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <FiImage /> {formData.image ? formData.image.name : 'Görsel Seç'}
                <input type="file" hidden onChange={(e) => {
                    const file = e.target.files ? e.target.files[0] : null;
                    if (file) setFormData(prev => ({...prev, image: file}));
                }} />
              </label>
              {editingPost?.image && !formData.image && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mevcut görsel korunacak.</div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '3rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>İçerik</label>
            <div className="rich-editor" style={{ color: '#000' }}>
               <Suspense fallback={<div>Düzenleyici yükleniyor...</div>}>
                  <ReactQuill 
                    theme="snow" 
                    value={formData.content} 
                    onChange={(val) => setFormData(prev => ({...prev, content: val}))}
                    style={{ height: '300px', marginBottom: '50px', background: '#fff', borderRadius: '10px', overflow: 'hidden' }}
                  />
               </Suspense>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
             <button type="button" onClick={() => setIsFormOpen(false)} style={{ padding: '1rem 2rem', borderRadius: '10px', fontWeight: 600, background: 'rgba(255,255,255,0.05)' }}>İptal</button>
             <button type="submit" style={{ padding: '1rem 2rem', borderRadius: '10px', fontWeight: 700, background: 'var(--accent-gradient)', color: '#fff' }}>
                <FiSave style={{ marginRight: '0.5rem' }} /> {editingPost ? 'Güncelle' : 'Yayınla'}
             </button>
          </div>
        </form>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {isLoading ? (
            <p>Yükleniyor...</p>
          ) : posts.length === 0 ? (
            <div className="glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: 'var(--radius-xl)', borderStyle: 'dashed' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Henüz yazı eklenmemiş.</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="glass card-hover" style={{ padding: '1.5rem 2rem', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                  {post.image && (
                    <img 
                        src={pb.files.getURL(post, post.image)} 
                        alt="" 
                        style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: '8px' }} 
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{post.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{post.category} • {post.created ? new Date(post.created).toLocaleDateString('tr-TR') : ''}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(post)} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}><FiEdit2 /></button>
                  <button onClick={() => handleDelete(post.id)} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: 'none', cursor: 'pointer' }}><FiTrash2 /></button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
