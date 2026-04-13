import { useLanguage } from '../../contexts/LanguageContext';

const ReactQuill = dynamic(() => import('react-quill-new'), { 
    ssr: false,
    loading: () => <div style={{ height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Editor...</div>
});
import 'react-quill-new/dist/quill.snow.css';

export default function BlogManager() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [filter, setFilter] = useState('all'); 
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
    if (window.confirm(t?.dashboard?.actions?.archive + '?')) {
      try {
        await pb.collection('posts').update(post.id, { status: 'archived' });
        fetchPosts();
      } catch (error) {
        alert('Error.');
      }
    }
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

  const statusIcons = {
    published: <FiCheckCircle style={{ color: '#10b981' }} />,
    draft: <FiClock style={{ color: '#f59e0b' }} />,
    archived: <FiArchive style={{ color: '#ef4444' }} />
  };

  return (
    <div className="animate-fade">
      <header style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: 'clamp(2rem, 5vw, 3rem)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: 'var(--h2-size)', fontWeight: 950, letterSpacing: '-1.5px' }}>{t?.dashboard?.blogMode}</h2>
          {!isFormOpen && (
            <button onClick={() => { setEditingPost(null); setFormData({ title: '', slug: '', content: '', category: '', status: 'draft', image: null }); setIsFormOpen(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1.5rem' }}>
              <FiPlus /> {t?.dashboard?.actions?.addNew}
            </button>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
           {['all', 'published', 'draft', 'archived'].map(f => (
             <button 
              key={f}
              onClick={() => setFilter(f)}
              style={{ 
                padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                background: filter === f ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.05)',
                color: filter === f ? '#fff' : 'var(--text-secondary)',
                border: 'none', cursor: 'pointer', whiteSpace: 'nowrap'
              }}
             >
               {f === 'all' ? t?.blog?.categoryAll : f === 'published' ? 'Published' : f === 'draft' ? 'Drafts' : 'Archived'}
             </button>
           ))}
        </div>
      </header>

      {isFormOpen ? (
        <div style={{ display: 'grid', gridTemplateColumns: (showPreview && !window?.matchMedia('(max-width: 1024px)').matches) ? '1fr 1fr' : '1fr', gap: '2rem' }}>
          <form onSubmit={handleSubmit} className="glass" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', borderRadius: 'var(--radius-xl)', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{editingPost ? t?.dashboard?.actions?.edit : t?.dashboard?.actions?.addNew}</h3>
                <button type="button" className="desktop-only" onClick={() => setShowPreview(!showPreview)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#fff', cursor: 'pointer' }}>
                    <FiMonitor /> {showPreview ? 'Close Preview' : 'Live Preview'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className="form-label">Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))} required className="form-input" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className="form-label">Status</label>
                <select value={formData.status} onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))} className="form-input">
                  <option value="draft" style={{ background: '#1a1a1a' }}>📝 Draft</option>
                  <option value="published" style={{ background: '#1a1a1a' }}>🚀 Publish</option>
                  <option value="archived" style={{ background: '#1a1a1a' }}>🗄️ Archive</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className="form-label">Category</label>
                <input type="text" value={formData.category} onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))} className="form-input" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className="form-label">Cover Image</label>
                <label className="glass" style={{ padding: '0.85rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', borderStyle: 'dashed', fontSize: '0.9rem' }}>
                  <FiImage /> {formData.image ? formData.image.name : 'Choose Image'}
                  <input type="file" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) setFormData(prev => ({...prev, image: f})); }} />
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2.5rem' }}>
              <label className="form-label">Content</label>
              <div className="rich-editor-container" style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
                 <Suspense fallback={<div>Loading editor...</div>}>
                    <ReactQuill 
                        theme="snow" 
                        value={formData.content} 
                        onChange={(val) => setFormData(prev => ({...prev, content: val}))} 
                        modules={editorModules}
                        formats={editorFormats}
                        style={{ height: '350px', color: '#000' }} 
                    />
                 </Suspense>
              </div>
              <div style={{ height: '50px' }}></div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
               <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)} style={{ padding: '0.8rem 1.5rem' }}>{t?.dashboard?.actions?.cancel}</button>
               <button type="submit" className="btn-primary" style={{ padding: '0.8rem 2rem' }}>
                  <FiSave style={{ marginRight: '0.5rem' }} /> {editingPost ? t?.dashboard?.actions?.save : t?.dashboard?.actions?.addNew}
               </button>
            </div>
          </form>

          {showPreview && (
            <div className="glass preview-container desktop-only" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)', overflowY: 'auto', maxHeight: '100vh', position: 'sticky', top: '2rem' }}>
                 <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '2px' }}>Live Preview</h3>
                 <div className="blog-content-preview">
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.5rem', lineHeight: 1.1 }}>{formData.title || 'Untitled Post'}</h1>
                    <div dangerouslySetInnerHTML={{ __html: formData.content }} className="rich-text-content" />
                 </div>
                 <style jsx global>{`
                    .rich-text-content { font-size: 1.1rem; line-height: 1.7; color: var(--text-primary); }
                    .rich-text-content h1, .rich-text-content h2 { font-size: 1.75rem; font-weight: 800; margin: 2rem 0 1rem; }
                    .rich-text-content p { margin-bottom: 1.25rem; }
                    .rich-text-content blockquote { border-left: 4px solid var(--accent); padding-left: 1.5rem; font-style: italic; opacity: 0.8; margin: 2rem 0; }
                    .rich-text-content pre { background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; margin: 1.5rem 0; font-family: monospace; }
                    .rich-text-content img { max-width: 100%; border-radius: 12px; }
                    .rich-text-content ul, .rich-text-content ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
                 `}</style>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {isLoading ? <p>{t?.blog?.loading}</p> : posts.length === 0 ? (
            <div className="glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: 'var(--radius-xl)', borderStyle: 'dashed' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No posts found.</p>
            </div>
          ) : posts.map(post => (
              <div key={post.id} className="glass card-hover" style={{ padding: 'clamp(1rem, 3vw, 1.25rem) clamp(1rem, 3vw, 1.5rem)', borderRadius: 'var(--radius-lg)', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flex: '1 1 250px' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    {post.image ? <img src={pb.files.getURL(post, post.image)} alt="" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '8px' }} /> : <div style={{ width: 50, height: 50, borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }} />}
                    <div style={{ position: 'absolute', top: -8, right: -8, background: 'var(--bg-color)', border: '1px solid var(--glass-border)', padding: '3px', borderRadius: '50%', display: 'flex', fontSize: '0.8rem' }}>{statusIcons[post.status || 'draft']}</div>
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{post.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{post.category || 'General'} • {post.created ? new Date(post.created.substring(0, 10)).toLocaleDateString() : ''}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button title={t?.dashboard?.actions?.edit} onClick={() => handleEdit(post)} style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}><FiEdit2 /></button>
                  {post.status !== 'archived' && <button title={t?.dashboard?.actions?.archive} onClick={() => handleArchive(post)} style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: 'none', cursor: 'pointer' }}><FiArchive /></button>}
                  <button title={t?.dashboard?.actions?.delete} onClick={() => handleDelete(post.id)} style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: 'none', cursor: 'pointer' }}><FiTrash2 /></button>
                </div>
              </div>
          ))}
        </div>
      )}
    </div>
  );
}
