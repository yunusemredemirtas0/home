'use client';
import { useState, useEffect, use, useRef } from 'react';
import Link from 'next/link';
import pb from '../../../lib/pocketbase';
import { useLanguage } from '../../../contexts/LanguageContext';
import { FiArrowLeft, FiExternalLink, FiCpu, FiLayout, FiActivity } from 'react-icons/fi';

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
            } catch (e) { console.error(e); }
        });
    }
  }, [isMounted, project]);

  if (!isMounted || !project) return null;

  const gallery = Array.isArray(project.gallery) ? project.gallery : [];

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 4rem)', paddingBottom: '12rem' }} className="animate-fade">
      {/* Premium Background Blobs */}
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3" style={{ top: '60%', left: '70%' }}></div>
      </div>

      <div className="container" style={{ maxWidth: 1100 }}>
         <header style={{ marginBottom: '8rem' }}>
            <Link href="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '4rem', fontWeight: 600, fontSize: '0.9rem' }} className="hover-accent">
                <FiArrowLeft /> {language === 'tr' ? 'Tüm Projeler' : 'All Projects'}
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(320px, 1fr)', gap: '5rem', alignItems: 'end' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '2rem', fontSize: '0.85rem' }}>
                        <FiActivity /> {language === 'tr' ? 'DURUM ÇALIŞMASI' : 'CASE STUDY'}
                    </div>
                    <h1 style={{ fontSize: 'clamp(3rem, 7vw, 4.5rem)', fontWeight: 950, letterSpacing: '-3px', lineHeight: 1.05, marginBottom: '2rem', color: '#fff' }}>
                        {project.title}
                    </h1>
                </div>
                
                <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)', display: 'grid', gap: '2rem', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'var(--accent)', filter: 'blur(50px)', opacity: 0.1 }}></div>
                    {project.tech_stack && (
                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                            <div style={{ background: 'var(--accent-gradient)', padding: '0.85rem', borderRadius: '14px', color: '#fff', boxShadow: '0 8px 16px rgba(124, 58, 237, 0.3)' }}><FiCpu size={22} /></div>
                            <div>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>TECHNOLOGIES</p>
                                <p style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>{project.tech_stack}</p>
                            </div>
                        </div>
                    )}
                    {project.link && (
                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ width: '100%', gap: '0.85rem', padding: '1.15rem' }}>
                            {language === 'tr' ? 'Projeyi Keşfet' : 'Explore Project'} <FiExternalLink />
                        </a>
                    )}
                </div>
            </div>
         </header>

         {project.image && (
            <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: '8rem', boxShadow: '0 60px 100px -30px rgba(0,0,0,0.8)', border: '1px solid var(--glass-border)' }}>
                <img src={pb.files.getURL(project, project.image)} alt={project.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)' }}></div>
            </div>
         )}

         <div style={{ display: 'grid', gridTemplateColumns: gallery.length > 0 ? 'minmax(0, 1fr) minmax(0, 2fr)' : '1fr', gap: '6rem' }}>
            {gallery.length > 0 && (
              <aside style={{ position: 'sticky', top: 'calc(var(--nav-height) + 4rem)', height: 'fit-content' }}>
                  <div style={{ display: 'grid', gap: '3rem' }}>
                      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                          <h4 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}><FiLayout /> {language === 'tr' ? 'Galeri' : 'Gallery'}</h4>
                          <div style={{ display: 'grid', gap: '1.5rem' }}>
                              {gallery.map((img, idx) => (
                                  <div key={idx} style={{ borderRadius: '14px', overflow: 'hidden', cursor: 'zoom-in', transition: 'transform 0.3s ease', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }} className="card-hover">
                                      <img src={pb.files.getURL(project, img)} alt={`${project.title} gallery ${idx}`} style={{ width: '100%', height: 'auto' }} />
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </aside>
            )}

            <div 
              ref={contentRef}
              className="premium-rich-text" 
              dangerouslySetInnerHTML={{ __html: project.description || '' }}
              style={{ fontSize: '1.25rem', maxWidth: gallery.length > 0 ? 'none' : '850px', margin: gallery.length > 0 ? '0' : '0 auto' }}
            />
         </div>
      </div>

      <style jsx global>{`
        .premium-rich-text pre code { padding: 0 !important; background: transparent !important; }
        .card-hover:hover { transform: scale(1.03) translateY(-5px); }
      `}</style>
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
      } catch (error) { console.error(error); }
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
