'use client';
import { useState, useEffect, use, useRef } from 'react';
import Link from 'next/link';
import pb from '../../../lib/pocketbase';
import { useLanguage } from '../../../contexts/LanguageContext';
import { FiArrowLeft, FiExternalLink, FiCpu } from 'react-icons/fi';

const ProjectDetailContent = ({ project, language }) => {
  const contentRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && project && contentRef.current) {
        import('highlight.js').then((hljs) => {
            try {
                import('highlight.js/styles/github-dark.css');
                contentRef.current.querySelectorAll('pre').forEach((block) => {
                    hljs.default.highlightElement(block);
                });
            } catch (e) {
                console.error('Highlight error:', e);
            }
        }).catch(err => console.error('Highlight.js load error:', err));
    }
  }, [isMounted, project]);

  if (!isMounted || !project) return null;

  // Ensure gallery is an array
  const gallery = Array.isArray(project.gallery) ? project.gallery : [];

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 2rem)', paddingBottom: '10rem' }} className="animate-fade">
      <div className="container" style={{ maxWidth: 1100 }}>
         <header style={{ marginBottom: '6rem' }}>
            <Link href="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '4rem', fontWeight: 600, fontSize: '0.95rem' }}>
                <FiArrowLeft /> {language === 'tr' ? 'Tüm Projeler' : 'All Projects'}
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '4rem', alignItems: 'end' }}>
                <div>
                    <p style={{ color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        Case Study / {project.tech_stack || 'Web Development'}
                    </p>
                    <h1 style={{ fontSize: 'clamp(3.5rem, 8vw, 6rem)', fontWeight: 950, letterSpacing: '-4px', lineHeight: 1, marginBottom: '2rem', color: '#fff' }}>
                        {project.title || 'Project title'}
                    </h1>
                </div>
                
                <div className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)', display: 'grid', gap: '1.5rem' }}>
                    {project.tech_stack && (
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ background: 'var(--accent)', padding: '0.75rem', borderRadius: '12px', color: '#fff' }}><FiCpu size={20} /></div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Tech Stack</p>
                                <p style={{ fontWeight: 700 }}>{project.tech_stack}</p>
                            </div>
                        </div>
                    )}
                    {project.link && (
                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ width: '100%', gap: '0.75rem' }}>
                            {language === 'tr' ? 'Projeyi Görüntüle' : 'View Live Project'} <FiExternalLink />
                        </a>
                    )}
                </div>
            </div>
         </header>

         {project.image && (
            <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: '8rem', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.7)', border: '1px solid var(--glass-border)' }}>
                <img src={pb.files.getURL(project, project.image)} alt={project.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
         )}

         <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: '6rem' }}>
            <aside style={{ position: 'sticky', top: 'calc(var(--nav-height) + 2rem)', height: 'fit-content' }}>
                <div style={{ display: 'grid', gap: '3rem' }}>
                    <div>
                        <h4 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1.5rem' }}>{language === 'tr' ? 'Galeri' : 'Gallery'}</h4>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {gallery.length > 0 ? gallery.map((img, idx) => (
                                <div key={idx} className="glass" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                    <img src={pb.files.getURL(project, img)} alt={`${project.title} gallery ${idx}`} style={{ width: '100%', height: 'auto' }} />
                                </div>
                            )) : (
                                <p style={{ opacity: 0.3, fontSize: '0.9rem' }}>{language === 'tr' ? 'Galeri boş.' : 'Gallery empty.'}</p>
                            )}
                        </div>
                    </div>
                </div>
            </aside>

            <div 
              ref={contentRef}
              className="premium-rich-text" 
              dangerouslySetInnerHTML={{ __html: project.description || '' }}
              style={{ fontSize: '1.25rem' }}
            />
         </div>
      </div>
    </div>
  );
};

export default function ProjectDetail({ params }) {
  const { slug } = use(params);
  const { language } = useLanguage();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      try {
        const record = await pb.collection('projects').getFirstListItem(`slug="${slug}" && status="published"`);
        setProject(record);
      } catch (error) {
        console.error('Error fetching project:', error);
        setProject(null);
      }
      setIsLoading(false);
    }
    fetchProject();
  }, [slug]);

  if (isLoading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>Yükleniyor...</p></div>;
  if (!project) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
        <p>Proje bulunamadı.</p>
        <Link href="/projects" className="btn-primary">Projelere Geri Dön</Link>
    </div>
  );

  return <ProjectDetailContent project={project} language={language} />;
}
