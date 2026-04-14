'use client';
import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiImage, FiLink, FiCpu, FiArchive, FiDownload, FiCheckCircle, FiClock, FiMonitor, FiType, FiUploadCloud, FiInfo, FiExternalLink, FiLayers, FiPaperclip, FiCheck } from 'react-icons/fi';
import pb from '../../lib/pocketbase';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div style={{ height: '300px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>Editor yükleniyor...</div>
});
import 'react-quill-new/dist/quill.snow.css';

export default function ProjectManager() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showPreview, setShowPreview] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    category: '',
    github: '',
    demo: '',
    technologies: '',
    status: 'draft',
    image: null,
    imagePreview: null
  });

  useEffect(() => {
    fetchProjects();
  }, [filter]);

  async function fetchProjects() {
    setLoading(true);
    try {
      // Data Recovery Fix: Disable auto-cancellation for reliable listing
      pb.autoCancellation(false);
      
      let filterQuery = '';
      if (filter === 'published') filterQuery = 'status = "published"';
      if (filter === 'draft') filterQuery = 'status = "draft"';
      if (filter === 'archived') filterQuery = 'status = "archived"';

      const records = await pb.collection('projects').getFullList({
        filter: filterQuery,
        sort: '-created'
      });
      console.log('Project fetch success:', records.length, 'items');
      setProjects(records || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }

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

  const handleEdit = (project) => {
    setFormData({
      title: project.title,
      slug: project.slug,
      description: project.description,
      category: project.category || '',
      github: project.github || '',
      demo: project.demo || '',
      technologies: project.technologies || '',
      status: project.status,
      image: project.image,
      imagePreview: project.image ? pb.files.getURL(project, project.image) : null
    });
    setEditingId(project.id);
    setIsFormOpen(true);
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
        await pb.collection('projects').update(editingId, data);
      } else {
        await pb.collection('projects').create(data);
      }
      setIsFormOpen(false);
      resetForm();
      fetchProjects();
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', slug: '', description: '', category: '', github: '', demo: '', technologies: '', status: 'draft', image: null, imagePreview: null });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu projeyi silmek istediğine emin misin?')) {
      await pb.collection('projects').delete(id);
      fetchProjects();
    }
  }

  const handleArchive = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'archived' ? 'draft' : 'archived';
      await pb.collection('projects').update(id, { status: newStatus });
      fetchProjects();
    } catch (err) { console.error(err); }
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
            <h2 style={{ fontSize: '1.75rem', fontWeight: 950 }}>{editingId ? 'Projeyi Düzenle' : 'Yeni Proje Ekle'}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Projeni dünyaya tanıtmadan önce son bir kez önizle.</p>
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
                    <label className="form-label">Proje Başlığı</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))} className="form-input" placeholder="Proje adını gir..." required />
                  </div>
                  <div className="input-group">
                    <label className="form-label">Durum</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                       {statusOptions.map(opt => (
                         <button key={opt.value} type="button" onClick={() => setFormData(prev => ({...prev, status: opt.value}))} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', background: formData.status === opt.value ? opt.color : 'rgba(255,255,255,0.03)', border: '1px solid', borderColor: formData.status === opt.value ? opt.color : 'var(--glass-border)', color: formData.status === opt.value ? '#fff' : 'var(--text-secondary)', transition: 'all 0.4s' }}>{opt.icon}</button>
                       ))}
                    </div>
                  </div>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="input-group">
                    <label className="form-label">Kategori</label>
                    <input type="text" value={formData.category} onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))} className="form-input" placeholder="Web, Mobil, AI..." />
                  </div>
                  <div className="input-group">
                    <label className="form-label">Teknolojiler</label>
                    <input type="text" value={formData.technologies} onChange={(e) => setFormData(prev => ({...prev, technologies: e.target.value}))} className="form-input" placeholder="React, Node.js, PB..." />
                  </div>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="input-group">
                    <label className="form-label">GitHub</label>
                    <input type="url" value={formData.github} onChange={(e) => setFormData(prev => ({...prev, github: e.target.value}))} className="form-input" placeholder="https://github..." />
                  </div>
                  <div className="input-group">
                    <label className="form-label">Yayın Linki (Demo)</label>
                    <input type="url" value={formData.demo} onChange={(e) => setFormData(prev => ({...prev, demo: e.target.value}))} className="form-input" placeholder="https://demo..." />
                  </div>
               </div>
            </div>

            <div className="form-group-card">
              <label className="form-label" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiCpu style={{ color: 'var(--accent)' }}/> Teknik Detaylar / Tanıtım</label>
              <ReactQuill 
                theme="snow" 
                value={formData.description} 
                onChange={(val) => setFormData(prev => ({...prev, description: val}))} 
                style={{ height: '350px', marginBottom: '3.5rem' }}
              />
            </div>

            <div className="form-group-card">
               <label className="form-label"><FiImage style={{ color: 'var(--accent)' }}/> Kapak Resmi</label>
               <div className="drop-zone" onClick={() => document.getElementById('imageInput').click()}>
                  {formData.imagePreview ? (
                    <img src={formData.imagePreview} style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '14px' }} />
                  ) : (
                    <>
                      <FiUploadCloud size={40} opacity={0.3} />
                      <p style={{ opacity: 0.5, fontSize: '0.9rem' }}>Sürükle veya Gözat</p>
                    </>
                  )}
                  <input id="imageInput" type="file" hidden onChange={handleImageChange} />
               </div>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '1.25rem', fontSize: '1.1rem', borderRadius: '20px', boxShadow: '0 25px 50px rgba(124,58,237,0.3)', width: '100%' }}>
              <FiSave /> {editingId ? 'Proje Güncelle' : 'Proje Yayınla'}
            </button>
          </form>

          {/* Centered Sticky Preview Column (v4) */}
          {showPreview && (
            <div className="desktop-only sticky-center" style={{ width: '100%' }}>
               <div className="device-frame" style={{ border: '10px solid #1a1a1a', borderRadius: '40px', overflow: 'hidden' }}>
                  <div className="device-header">
                     <div className="device-dot" />
                     <div className="device-dot" />
                     <div className="device-dot" />
                     <div style={{ marginLeft: 'auto', fontSize: '0.65rem', opacity: 0.4, fontWeight: 900, letterSpacing: '2px' }}>PROJECT LIVE</div>
                  </div>
                  <div className="custom-scrollbar" style={{ height: '75vh', overflowY: 'auto', background: 'var(--bg-color)', padding: '2.5rem' }}>
                     {formData.imagePreview && <img src={formData.imagePreview} style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: '24px', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)' }} />}
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: '1rem' }}>
                        <div>
                           <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '2px' }}>{formData.category || 'Portfolio'}</span>
                           <h1 style={{ fontSize: '2.25rem', fontWeight: 950, margin: '0.75rem 0', letterSpacing: '-1.5px' }}>{formData.title || 'Adsız Proje'}</h1>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                           {formData.github && <div className="glass" style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiCpu /></div>}
                           {formData.demo && <div className="glass" style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiExternalLink /></div>}
                        </div>
                     </div>
                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                        {(formData.technologies || 'React, Tailwind...').split(',').map((tag, i) => (
                           <span key={i} style={{ fontSize: '0.7rem', fontWeight: 800, padding: '4px 12px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.2)' }}>{tag.trim()}</span>
                        ))}
                     </div>
                     <div className="premium-rich-text custom-quill-content" dangerouslySetInnerHTML={{ __html: formData.description }} />
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
          <h2 style={{ fontSize: '2.25rem', fontWeight: 950, letterSpacing: '-1.5px' }}>Proje Arşivi</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Mimari yeteneklerini ve teknik donanımını sergilediğin projeler.</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="btn-primary" style={{ padding: '0.85rem 1.75rem', borderRadius: '15px' }}>
          <FiPlus /> Yeni Proje Ekle
        </button>
      </header>

      <div className="glass" style={{ padding: '0.5rem', borderRadius: '20px', display: 'flex', gap: '0.5rem', width: 'fit-content' }}>
        {['all', 'published', 'draft', 'archived'].map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{ padding: '0.6rem 1.5rem', borderRadius: '15px', fontSize: '0.85rem', fontWeight: 800, textTransform: 'capitalize', background: filter === t ? 'var(--accent-gradient)' : 'transparent', color: filter === t ? '#fff' : 'var(--text-secondary)', transition: 'all 0.4s' }}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '5rem', textAlign: 'center' }}>Projeler derleniyor...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2.5rem' }}>
          {projects.map(project => {
            const status = statusOptions.find(o => o.value === project.status) || statusOptions[0];
            return (
              <div key={project.id} className="glass card-hover" style={{ borderRadius: '32px', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ position: 'relative', height: '190px' }}>
                  <img src={project.image ? pb.files.getURL(project, project.image) : '/project-placeholder.jpg'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', padding: '0.5rem 1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 900, color: status.color }}>
                    {status.icon} {status.label}
                  </div>
                </div>
                <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '1.5px' }}>{project.category || 'Genel'}</span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0.75rem 0', letterSpacing: '-0.5px' }}>{project.title}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', mb: '1.5rem', opacity: 0.6 }}>
                     {(project.technologies || '').split(',').slice(0, 3).map((tag, i) => (
                       <span key={i} style={{ fontSize: '0.65rem', fontWeight: 800, background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '6px' }}>#{tag.trim()}</span>
                     ))}
                  </div>
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button onClick={() => handleEdit(project)} className="glass-icon-btn" style={{ width: 40, height: 40, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}><FiEdit2 size={16}/></button>
                      <button onClick={() => handleArchive(project.id, project.status)} className="glass-icon-btn" style={{ width: 40, height: 40, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}><FiArchive size={16}/></button>
                      <button onClick={() => handleDelete(project.id)} className="glass-icon-btn" style={{ width: 40, height: 40, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}><FiTrash2 size={16}/></button>
                    </div>
                    {project.demo && <a href={project.demo} target="_blank" className="hover-accent" style={{ color: 'var(--text-secondary)' }}><FiExternalLink size={18}/></a>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!loading && projects.length === 0 && (
         <div className="glass" style={{ padding: '5rem', textAlign: 'center', borderRadius: '32px' }}>
            <FiLayers size={48} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
            <p style={{ opacity: 0.5, fontWeight: 700 }}>Bu kategoride henüz proje bulunmuyor.</p>
         </div>
      )}
    </div>
  );
}
