'use client';
import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiImage, FiLink, FiCpu } from 'react-icons/fi';
import pb from '../../lib/pocketbase';

export default function ProjectManager() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    tech_stack: '',
    link: '',
    image: null,
    gallery: []
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection('projects').getFullList({
        sort: '-created'
      });
      setProjects(records || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
    setIsLoading(false);
  };

  const handleEdit = (project) => {
    if (!project) return;
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      slug: project.slug || '',
      description: project.description || '',
      tech_stack: project.tech_stack || '',
      link: project.link || '',
      image: null,
      gallery: []
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (projectId) => {
    if (!projectId) return;
    if (window.confirm('Bu projeyi silmek istediğinize emin misiniz?')) {
      try {
        await pb.collection('projects').delete(projectId);
        setProjects(prev => prev.filter(p => p.id !== projectId));
      } catch (error) {
        alert('Silme işlemi sırasında bir hata oluştu.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    
    const slug = formData.slug || formData.title.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    data.append('slug', slug);
    data.append('description', formData.description);
    data.append('tech_stack', formData.tech_stack);
    data.append('link', formData.link);
    
    if (formData.image) {
      data.append('image', formData.image);
    }
    
    if (formData.gallery && formData.gallery.length > 0) {
      for (let file of formData.gallery) {
        data.append('gallery', file);
      }
    }

    try {
      if (editingProject) {
        await pb.collection('projects').update(editingProject.id, data);
      } else {
        await pb.collection('projects').create(data);
      }
      setIsFormOpen(false);
      setEditingProject(null);
      setFormData({ title: '', slug: '', description: '', tech_stack: '', link: '', image: null, gallery: [] });
      fetchProjects();
    } catch (error) {
      alert('Kaydetme hatası: ' + error.message);
    }
  };

  return (
    <div className="animate-fade">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-1.5px', marginBottom: '0.5rem' }}>Proje Yönetimi</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Tamamladığın projeleri sergiye ekle.</p>
        </div>
        {!isFormOpen && (
          <button 
            onClick={() => { 
                setEditingProject(null);
                setFormData({ title: '', slug: '', description: '', tech_stack: '', link: '', image: null, gallery: [] });
                setIsFormOpen(true); 
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.5rem', borderRadius: '12px', background: 'var(--accent-gradient)', color: '#fff', fontWeight: 700, boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.5)' }}
          >
            <FiPlus /> Yeni Proje Ekle
          </button>
        )}
      </header>

      {isFormOpen ? (
        <form onSubmit={handleSubmit} className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Proje Adı</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                required
                placeholder="Proje adı..."
                style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'inherit' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Teknoloji Yığını</label>
              <input 
                type="text" 
                value={formData.tech_stack}
                onChange={(e) => setFormData(prev => ({...prev, tech_stack: e.target.value}))}
                placeholder="Örn: Next.js, Tailwind, PocketBase"
                style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'inherit' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Proje Linki</label>
            <input 
              type="url" 
              value={formData.link}
              onChange={(e) => setFormData(prev => ({...prev, link: e.target.value}))}
              placeholder="https://..."
              style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Açıklama</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
              required
              rows={4}
              placeholder="Proje hakkında detaylar..."
              style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'inherit', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Ana Görsel</label>
              <label style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <FiImage /> {formData.image ? formData.image.name : 'Seç'}
                <input type="file" hidden onChange={(e) => {
                    const file = e.target.files ? e.target.files[0] : null;
                    if (file) setFormData(prev => ({...prev, image: file}));
                }} />
              </label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Galeri Görselleri (Çoklu)</label>
              <label style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <FiImage /> {formData.gallery && formData.gallery.length > 0 ? `${formData.gallery.length} Dosya Seçildi` : 'Seç'}
                <input type="file" multiple hidden onChange={(e) => {
                    const files = e.target.files ? Array.from(e.target.files) : [];
                    if (files.length > 0) setFormData(prev => ({...prev, gallery: files}));
                }} />
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
             <button type="button" onClick={() => setIsFormOpen(false)} style={{ padding: '1rem 2rem', borderRadius: '10px', fontWeight: 600, background: 'rgba(255,255,255,0.05)' }}>İptal</button>
             <button type="submit" style={{ padding: '1rem 2rem', borderRadius: '10px', fontWeight: 700, background: 'var(--accent-gradient)', color: '#fff' }}>
                <FiSave style={{ marginRight: '0.5rem' }} /> {editingProject ? 'Güncelle' : 'Ekle'}
             </button>
          </div>
        </form>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {isLoading ? (
            <p>Yükleniyor...</p>
          ) : projects.length === 0 ? (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary)', padding: '4rem' }}>Henüz proje eklenmemiş.</p>
          ) : (
            projects.map(project => (
              <div key={project.id} className="glass card-hover" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                 {project.image && (
                   <img src={pb.files.getURL(project, project.image)} alt="" style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                 )}
                 <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>{project.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{project.description}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                       <button onClick={() => handleEdit(project)} style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}><FiEdit2 /></button>
                       <button onClick={() => handleDelete(project.id)} style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: 'none', cursor: 'pointer' }}><FiTrash2 /></button>
                    </div>
                 </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
