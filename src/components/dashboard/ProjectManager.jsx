'use client';
import { useState, useEffect, Suspense } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiImage, FiLink, FiCpu, FiArchive, FiDownload, FiCheckCircle, FiClock, FiMonitor, FiType, FiUploadCloud, FiInfo, FiExternalLink, FiLayers, FiPaperclip } from 'react-icons/fi';
import pb from '../../lib/pocketbase';
import dynamic from 'next/dynamic';
import { editorModules, editorFormats } from '../../lib/editorConfig';
import { useLanguage } from '../../contexts/LanguageContext';

const ReactQuill = dynamic(() => import('react-quill-new'), { 
    ssr: false,
    loading: () => <div style={{ height: '300px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>Loading Editor...</div>
});
import 'react-quill-new/dist/quill.snow.css';

export default function ProjectManager() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [filter, setFilter] = useState('all'); 
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    tech_stack: '',
    link: '',
    status: 'draft',
    image: null,
    imagePreview: null,
    gallery: [],
    galleryPreviews: []
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia('(max-width: 1024px)').matches);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        filter: filterQuery,
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
      status: project.status || 'draft',
      image: null,
      imagePreview: project.image ? pb.files.getURL(project, project.image) : null,
      gallery: [],
      galleryPreviews: project.gallery?.map(img => pb.files.getURL(project, img)) || []
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (postId) => {
    if (window.confirm(t?.dashboard?.actions?.delete + '?')) {
      try {
        await pb.collection('projects').delete(postId);
        setProjects(prev => prev.filter(p => p.id !== postId));
      } catch (error) {
        alert('Error.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('slug', formData.slug || formData.title.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c'));
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

  const handleGalleryChange = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        gallery: files,
        galleryPreviews: files.map(f => URL.createObjectURL(f))
      }));
    }
  };

  const statusOptions = [
    { value: 'draft', label: 'Draft', icon: <FiClock />, color: '#f59e0b' },
    { value: 'published', label: 'Published', icon: <FiCheckCircle />, color: '#10b981' },
    { value: 'archived', label: 'Archived', icon: <FiArchive />, color: '#ef4444' }
  ];

  if (isFormOpen) {
    return (
      <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: (showPreview && !isMobile) ? '1.2fr 0.8fr' : '1fr', gap: '3rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
             <div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 950, letterSpacing: '-1px' }}>{editingProject ? 'Projeyi Düzenle' : 'Yeni Proje Ekle'}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>İşlerini en iyi şekilde sergile.</p>
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
                  <h4 style={{ fontWeight: 800, fontSize: '1rem' }}>Proje Bilgileri</h4>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="form-label">Proje Başlığı</label>
                    <div style={{ position: 'relative' }}>
                      <FiType style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                      <input type="text" value={formData.title} onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))} required className="form-input" style={{ paddingLeft: '2.8rem' }} placeholder="Projenin adını girin..." />
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
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="form-label">Kullanılan Teknolojiler</label>
                    <div style={{ position: 'relative' }}>
                      <FiCpu style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                      <input type="text" value={formData.tech_stack} onChange={(e) => setFormData(prev => ({...prev, tech_stack: e.target.value}))} placeholder="Örn: React, Node.js, PocketBase..." className="form-input" style={{ paddingLeft: '2.8rem' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="form-label">Proje Bağlantısı (URL)</label>
                    <div style={{ position: 'relative' }}>
                      <FiLink style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                      <input type="url" value={formData.link} onChange={(e) => setFormData(prev => ({...prev, link: e.target.value}))} placeholder="https://..." className="form-input" style={{ paddingLeft: '2.8rem' }} />
                    </div>
                  </div>
               </div>
            </div>

            {/* Content Card */}
            <div className="form-group-card" style={{ padding: '0.5rem', background: 'transparent', border: 'none' }}>
               <label className="form-label" style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>Proje Detayları</label>
               <div className="rich-editor-container" style={{ minHeight: '400px' }}>
                  <Suspense fallback={<div>Loading editor...</div>}>
                    <ReactQuill 
                        theme="snow" 
                        value={formData.description} 
                        onChange={(val) => setFormData(prev => ({...prev, description: val}))} 
                        modules={editorModules}
                        formats={editorFormats}
                        style={{ height: isMobile ? '350px' : '400px' }} 
                    />
                  </Suspense>
               </div>
            </div>

            {/* Media Card */}
            <div className="form-group-card">
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                  <FiImage color="var(--accent-blue)" />
                  <h4 style={{ fontWeight: 800, fontSize: '1rem' }}>Proje Görselleri</h4>
               </div>
               
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                  <div>
                    <label className="form-label" style={{ marginBottom: '1rem' }}>Ana Görsel</label>
                    <label className="drop-zone">
                        {formData.imagePreview && <div className="drop-zone-glow" />}
                        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            {formData.imagePreview ? (
                              <div style={{ width: '100%', height: '140px', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--accent)' }}>
                                <img src={formData.imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            ) : (
                              <FiUploadCloud size={32} opacity={0.3} />
                            )}
                            <p style={{ fontWeight: 800, fontSize: '0.85rem' }}>{formData.imagePreview ? 'Değiştir' : 'Ana Resim Yükle'}</p>
                        </div>
                        <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                    </label>
                  </div>

                  <div>
                    <label className="form-label" style={{ marginBottom: '1rem' }}>Galeri (Çoklu)</label>
                    <label className="drop-zone">
                        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                               {formData.galleryPreviews.slice(0, 3).map((img, i) => (
                                 <div key={i} style={{ width: 40, height: 40, borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                 </div>
                               ))}
                               {formData.galleryPreviews.length > 3 && <div style={{ width: 40, height: 40, borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>+{formData.galleryPreviews.length-3}</div>}
                               {formData.galleryPreviews.length === 0 && <FiLayers size={32} opacity={0.3} />}
                            </div>
                            <p style={{ fontWeight: 800, fontSize: '0.85rem' }}>{formData.galleryPreviews.length > 0 ? `${formData.galleryPreviews.length} Resim Seçildi` : 'Galeriye Ekle'}</p>
                        </div>
                        <input type="file" multiple hidden onChange={handleGalleryChange} accept="image/*" />
                    </label>
                  </div>
               </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '4rem' }}>
               <button type="button" className="glass" onClick={() => setIsFormOpen(false)} style={{ padding: '1rem 2.5rem', borderRadius: '15px', fontWeight: 700, fontSize: '0.9rem' }}>Vazgeç</button>
               <button type="submit" className="btn-primary" style={{ padding: '1rem 3rem', borderRadius: '15px', fontWeight: 900, fontSize: '0.95rem' }}>
                  <FiSave style={{ marginRight: '0.75rem' }} /> {editingProject ? 'Projeyi Güncelle' : 'Projeyi Yayınla'}
               </button>
            </div>
          </form>
        </div>

        {/* Premium Preview Section */}
        {showPreview && (
          <div className="desktop-only" style={{ position: 'sticky', top: '2rem' }}>
             <div className="device-frame" style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                <div className="device-header">
                   <div className="device-dot" style={{ background: '#ff5f56' }} />
                   <div className="device-dot" style={{ background: '#ffbd2e' }} />
                   <div className="device-dot" style={{ background: '#27c93f' }} />
                   <div style={{ marginLeft: '1rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>PROJECT PREVIEW</div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem' }} className="custom-scrollbar">
                   {formData.imagePreview && (
                     <div style={{ width: '100%', height: '220px', borderRadius: '18px', overflow: 'hidden', marginBottom: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                        <img src={formData.imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     </div>
                   )}
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '2rem', fontWeight: 950, marginBottom: '0.5rem', lineHeight: 1.1 }}>{formData.title || 'Proje Başlığı...'}</h1>
                        <p style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{formData.tech_stack || 'TEKNOLOJİ YIĞINI'}</p>
                      </div>
                      {formData.link && <div style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}><FiExternalLink /></div>}
                   </div>
                   <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.05)', margin: '2rem 0' }} />
                   <div dangerouslySetInnerHTML={{ __html: formData.description }} className="rich-text-content premium-rich-text" />
                   
                   {formData.galleryPreviews.length > 0 && (
                     <div style={{ marginTop: '3rem' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase' }}>PROJE GALERİSİ</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                           {formData.galleryPreviews.map((img, i) => (
                             <img key={i} src={img} style={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }} />
                           ))}
                        </div>
                     </div>
                   )}
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
          <h2 style={{ fontSize: 'var(--h2-size)', fontWeight: 950, letterSpacing: '-1.5px' }}>Proje Yönetimi</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Toplam {projects.length} proje bulunmaktadır.</p>
        </div>
        <button onClick={() => { setEditingProject(null); setFormData({ title: '', slug: '', description: '', tech_stack: '', link: '', status: 'draft', image: null, imagePreview: null, gallery: [], galleryPreviews: [] }); setIsFormOpen(true); }} className="btn-primary" style={{ padding: '0.8rem 1.75rem', borderRadius: '15px' }}>
          <FiPlus /> Yeni Proje Ekle
        </button>
      </header>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {['all', 'published', 'draft', 'archived'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className="glass" style={{ padding: '0.6rem 1.25rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800, background: filter === f ? 'var(--accent-gradient)' : 'transparent', border: '1px solid var(--glass-border)', color: filter === f ? '#fff' : 'var(--text-secondary)' }}>
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
        {isLoading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', opacity: 0.5, padding: '4rem' }}>Yükleniyor...</div>
        ) : projects.length === 0 ? (
          <div className="glass" style={{ gridColumn: '1/-1', padding: '5rem', textAlign: 'center', borderRadius: '32px', border: '1px solid var(--glass-border)', borderStyle: 'dashed' }}>
             <p style={{ opacity: 0.5 }}>Proje bulunamadı.</p>
          </div>
        ) : projects.map(project => {
           const status = statusOptions.find(o => o.value === project.status) || statusOptions[0];
           return (
            <div key={project.id} className="glass card-hover" style={{ borderRadius: '28px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
               <div style={{ position: 'relative', height: 220 }}>
                  {project.image ? <img src={pb.files.getURL(project, project.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiLayers size={40} opacity={0.1} /></div>}
                  <div style={{ position: 'absolute', top: 15, right: 15, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 900, color: status.color }}>
                     {status.icon} {status.label.toUpperCase()}
                  </div>
               </div>
               <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.5rem', color: '#fff' }}>{project.title}</h3>
                  <p style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>{project.tech_stack}</p>
                  
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                     <button onClick={() => handleEdit(project)} className="glass" style={{ width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}><FiEdit2 /></button>
                     <button onClick={() => handleDelete(project.id)} className="glass" style={{ width: 44, height: 44, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error)' }}><FiTrash2 /></button>
                  </div>
               </div>
            </div>
           );
        })}
      </div>
    </div>
  );
}
