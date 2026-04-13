'use client';
import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiImage, FiLink, FiCpu, FiArchive, FiDownload, FiCheckCircle, FiClock } from 'react-icons/fi';
import pb from '../../lib/pocketbase';

export default function ProjectManager() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all, published, draft, archived
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    tech_stack: '',
    link: '',
    status: 'draft',
    image: null,
    gallery: []
  });

  useEffect(() => {
    fetchProjects();
  }, [filter]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      let filterQuery = '';
      if (filter === 'published') filterQuery = 'status = "published"';
      if (filter === 'draft') filterQuery = 'status = "draft"';
      if (filter === 'archived') filterQuery = 'status = "archived"';

      const records = await pb.collection('projects').getFullList({
        filter: filterQuery
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
      status: project.status || 'draft',
      image: null,
      gallery: []
    });
    setIsFormOpen(true);
  };

  const handleArchive = async (project) => {
    if (window.confirm('Bu projeyi arşivlemek istediğinize emin misiniz? Siteden kaldırılacak ama burada saklanacak.')) {
      try {
        await pb.collection('projects').update(project.id, { status: 'archived' });
        fetchProjects();
      } catch (error) {
        alert('Arşivleme hatası.');
      }
    }
  };

  const handleDelete = async (projectId) => {
    if (window.confirm('DİKKAT: Bu projeyi KALICI olarak silmek istediğinize emin misiniz?')) {
      try {
        await pb.collection('projects').delete(projectId);
        setProjects(prev => prev.filter(p => p.id !== projectId));
      } catch (error) {
        alert('Silme hatası.');
      }
    }
  };

  const downloadBackup = (project) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `proje-yedek-${project.slug || project.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('slug', formData.slug || formData.title.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
    data.append('description', formData.description);
    data.append('tech_stack', formData.tech_stack);
    data.append('link', formData.link);
    data.append('status', formData.status);
    
    if (formData.image) data.append('image', formData.image);
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
      fetchProjects();
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
          <h2 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-1.5px', marginBottom: '0.5rem' }}>Proje Yönetimi</h2>
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
          <button onClick={() => { setEditingProject(null); setFormData({ title: '', slug: '', description: '', tech_stack: '', link: '', status: 'draft', image: null, gallery: [] }); setIsFormOpen(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.75rem' }}>
            <FiPlus /> Yeni Proje Ekle
          </button>
        )}
      </header>

      {isFormOpen ? (
        <form onSubmit={handleSubmit} className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Proje Adı</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))} required className="form-input" style={{ width: '100%' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Durum</label>
              <select 
                value={formData.status} 
                onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
                className="form-input"
                style={{ cursor: 'pointer' }}
              >
                <option value="draft" style={{ background: '#1a1a1a' }}>📝 Taslak</option>
                <option value="published" style={{ background: '#1a1a1a' }}>🚀 Yayınla</option>
                <option value="archived" style={{ background: '#1a1a1a' }}>🗄️ Arşivle</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Teknoloji Yığını</label>
              <input type="text" value={formData.tech_stack} onChange={(e) => setFormData(prev => ({...prev, tech_stack: e.target.value}))} className="form-input" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Proje Linki</label>
              <input type="url" value={formData.link} onChange={(e) => setFormData(prev => ({...prev, link: e.target.value}))} className="form-input" />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Açıklama</label>
            <textarea value={formData.description} onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))} required rows={4} className="form-input" style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Ana Görsel</label>
              <label className="glass" style={{ padding: '1rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', borderStyle: 'dashed' }}>
                <FiImage /> {formData.image ? formData.image.name : 'Seç'}
                <input type="file" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) setFormData(prev => ({...prev, image: f})); }} />
              </label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Galeri Görselleri</label>
              <label className="glass" style={{ padding: '1rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', borderStyle: 'dashed' }}>
                <FiImage /> {formData.gallery?.length > 0 ? `${formData.gallery.length} Dosya Selected` : 'Seç'}
                <input type="file" multiple hidden onChange={(e) => { const files = e.target.files ? Array.from(e.target.files) : []; if (files.length > 0) setFormData(prev => ({...prev, gallery: files})); }} />
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
             <button type="button" onClick={() => setIsFormOpen(false)} style={{ padding: '1rem 2rem', borderRadius: '10px', fontWeight: 600 }}>İptal</button>
             <button type="submit" className="btn-primary" style={{ padding: '1rem 2.5rem' }}>
                <FiSave style={{ marginRight: '0.5rem' }} /> {editingProject ? 'Güncelle' : 'Ekle'}
             </button>
          </div>
        </form>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {isLoading ? <p>Yükleniyor...</p> : projects.length === 0 ? (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', opacity: 0.5, padding: '4rem' }}>Bu filtreyle eşleşen proje bulunamadı.</p>
          ) : projects.map(project => (
              <div key={project.id} className="glass card-hover" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                 <div style={{ position: 'relative' }}>
                    {project.image ? <img src={pb.files.getURL(project, project.image)} alt="" style={{ width: '100%', height: 180, objectFit: 'cover' }} /> : <div style={{ width: '100%', height: 180, background: 'rgba(255,255,255,0.05)' }} />}
                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'var(--bg-color)', border: '1px solid var(--glass-border)', padding: '6px', borderRadius: '50%', display: 'flex' }}>{statusIcons[project.status || 'draft']}</div>
                 </div>
                 <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{project.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{project.description}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                       <button title="Yedek İndir" onClick={() => downloadBackup(project)} style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'none', cursor: 'pointer' }}><FiDownload /></button>
                       <button title="Düzenle" onClick={() => handleEdit(project)} style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}><FiEdit2 /></button>
                       {project.status !== 'archived' && <button title="Arşivle" onClick={() => handleArchive(project)} style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: 'none', cursor: 'pointer' }}><FiArchive /></button>}
                       <button title="Kalıcı Sil" onClick={() => handleDelete(project.id)} style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: 'none', cursor: 'pointer' }}><FiTrash2 /></button>
                    </div>
                 </div>
              </div>
          ))}
        </div>
      )}
    </div>
  );
}
