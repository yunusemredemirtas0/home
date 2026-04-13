'use client';
import { useState, useEffect, Suspense } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiImage, FiLink, FiCpu, FiArchive, FiDownload, FiCheckCircle, FiClock, FiMonitor } from 'react-icons/fi';
import pb from '../../lib/pocketbase';
import dynamic from 'next/dynamic';
import { editorModules, editorFormats } from '../../lib/editorConfig';
import { useLanguage } from '../../contexts/LanguageContext';

const ReactQuill = dynamic(() => import('react-quill-new'), { 
    ssr: false,
    loading: () => <div style={{ height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Editor...</div>
});
import 'react-quill-new/dist/quill.snow.css';

export default function ProjectManager() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [filter, setFilter] = useState('all'); 
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
    if (window.confirm(t?.dashboard?.actions?.archive + '?')) {
      try {
        await pb.collection('projects').update(project.id, { status: 'archived' });
        fetchProjects();
      } catch (error) {
        alert('Error.');
      }
    }
  };

  const handleDelete = async (projectId) => {
    if (window.confirm(t?.dashboard?.actions?.delete + '?')) {
      try {
        await pb.collection('projects').delete(projectId);
        setProjects(prev => prev.filter(p => p.id !== projectId));
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

  const statusIcons = {
    published: <FiCheckCircle style={{ color: '#10b981' }} />,
    draft: <FiClock style={{ color: '#f59e0b' }} />,
    archived: <FiArchive style={{ color: '#ef4444' }} />
  };

  return (
    <div className="animate-fade">
      <header style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: 'clamp(2rem, 5vw, 3rem)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: 'var(--h2-size)', fontWeight: 950, letterSpacing: '-1.5px' }}>{t?.dashboard?.projectMode}</h2>
          {!isFormOpen && (
            <button onClick={() => { setEditingProject(null); setFormData({ title: '', slug: '', description: '', tech_stack: '', link: '', status: 'draft', image: null, gallery: [] }); setIsFormOpen(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1.5rem' }}>
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
          <form onSubmit={handleSubmit} className="glass" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{editingProject ? t?.dashboard?.actions?.edit : t?.dashboard?.actions?.addNew}</h3>
                <button type="button" className="desktop-only" onClick={() => setShowPreview(!showPreview)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#fff', cursor: 'pointer' }}>
                    <FiMonitor /> {showPreview ? 'Close Preview' : 'Live Preview'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className="form-label">Project Title</label>
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
                <label className="form-label">Tech Stack</label>
                <input type="text" value={formData.tech_stack} onChange={(e) => setFormData(prev => ({...prev, tech_stack: e.target.value}))} className="form-input" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className="form-label">Project Link</label>
                <input type="url" value={formData.link} onChange={(e) => setFormData(prev => ({...prev, link: e.target.value}))} className="form-input" />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
              <label className="form-label">Description & Details</label>
              <div className="rich-editor-container" style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
                 <Suspense fallback={<div>Loading editor...</div>}>
                    <ReactQuill 
                        theme="snow" 
                        value={formData.description} 
                        onChange={(val) => setFormData(prev => ({...prev, description: val}))} 
                        modules={editorModules}
                        formats={editorFormats}
                        style={{ height: '300px', color: '#000' }} 
                    />
                 </Suspense>
              </div>
              <div style={{ height: '50px' }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className="form-label">Main Image</label>
                <label className="glass" style={{ padding: '0.85rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', borderStyle: 'dashed', fontSize: '0.9rem' }}>
                  <FiImage /> {formData.image ? formData.image.name : 'Choose'}
                  <input type="file" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) setFormData(prev => ({...prev, image: f})); }} />
                </label>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className="form-label">Gallery Images</label>
                <label className="glass" style={{ padding: '0.85rem', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', borderStyle: 'dashed', fontSize: '0.9rem' }}>
                  <FiImage /> {formData.gallery?.length > 0 ? `${formData.gallery.length} Files Selected` : 'Choose'}
                  <input type="file" multiple hidden onChange={(e) => { const files = e.target.files ? Array.from(e.target.files) : []; if (files.length > 0) setFormData(prev => ({...prev, gallery: files})); }} />
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}>
               <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)} style={{ padding: '0.8rem 1.5rem' }}>{t?.dashboard?.actions?.cancel}</button>
               <button type="submit" className="btn-primary" style={{ padding: '0.8rem 2rem' }}>
                  <FiSave style={{ marginRight: '0.5rem' }} /> {editingProject ? t?.dashboard?.actions?.save : t?.dashboard?.actions?.addNew}
               </button>
            </div>
          </form>

          {showPreview && (
            <div className="glass preview-container desktop-only" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)', overflowY: 'auto', maxHeight: '100vh', position: 'sticky', top: '2rem' }}>
                 <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '2px' }}>Project Preview</h3>
                 <div className="project-content-preview">
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', lineHeight: 1.1 }}>{formData.title || 'Untitled Project'}</h1>
                    <p style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: '2rem' }}>{formData.tech_stack}</p>
                    <div dangerouslySetInnerHTML={{ __html: formData.description }} className="rich-text-content" />
                 </div>
                 <style jsx global>{`
                    .rich-text-content { font-size: 1.1rem; line-height: 1.7; color: var(--text-primary); }
                    .rich-text-content h1, .rich-text-content h2 { font-size: 1.75rem; font-weight: 800; margin: 2rem 0 1rem; }
                    .rich-text-content p { margin-bottom: 1.25rem; }
                    .rich-text-content blockquote { border-left: 4px solid var(--accent); padding-left: 1.5rem; font-style: italic; opacity: 0.8; margin: 2rem 0; }
                    .rich-text-content pre { background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; margin: 1.5rem 0; font-family: monospace; }
                    .rich-text-content img { max-width: 100%; border-radius: 12px; }
                 `}</style>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '1.5rem' }}>
          {isLoading ? <p>{t?.projects?.loading}</p> : projects.length === 0 ? (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', opacity: 0.5, padding: '4rem' }}>No projects found for this filter.</p>
          ) : projects.map(project => (
              <div key={project.id} className="glass card-hover" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
                 <div style={{ position: 'relative' }}>
                    {project.image ? <img src={pb.files.getURL(project, project.image)} alt="" style={{ width: '100%', height: 180, objectFit: 'cover' }} /> : <div style={{ width: '100%', height: 180, background: 'rgba(255,255,255,0.05)' }} />}
                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'var(--bg-color)', border: '1px solid var(--glass-border)', padding: '6px', borderRadius: '50%', display: 'flex' }}>{statusIcons[project.status || 'draft']}</div>
                 </div>
                 <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{project.title}</h3>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: project.description }} />
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                       <button title={t?.dashboard?.actions?.edit} onClick={() => handleEdit(project)} style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}><FiEdit2 /></button>
                       {project.status !== 'archived' && <button title={t?.dashboard?.actions?.archive} onClick={() => handleArchive(project)} style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: 'none', cursor: 'pointer' }}><FiArchive /></button>}
                       <button title={t?.dashboard?.actions?.delete} onClick={() => handleDelete(project.id)} style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: 'none', cursor: 'pointer' }}><FiTrash2 /></button>
                    </div>
                 </div>
              </div>
          ))}
        </div>
      )}
    </div>
  );
}
