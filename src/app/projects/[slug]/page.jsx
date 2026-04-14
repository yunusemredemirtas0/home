'use client';
import { useState, useEffect, use, useRef } from 'react';
import Link from 'next/link';
import pb from '../../../lib/pocketbase';
import { useLanguage } from '../../../contexts/LanguageContext';
import { FiArrowLeft, FiExternalLink, FiLayout } from 'react-icons/fi';
import ShareBar from '../../../components/ShareBar';
import GiscusComments from '../../../components/GiscusComments';

import { trackView } from '../../../lib/analytics';

const ProjectDetailContent = ({ project, language }) => {
  const contentRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  // --- GISCUS CONFIGURATION ---
  const repoId = "R_kgDOQ70S0w"; 
  const categoryId = "DIC_kwDOQ70S084C6xQG";
  // ----------------------------

  useEffect(() => {
    setIsMounted(true);
    if (project?.id) {
        trackView('projects', project.id);
    }
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
      {/* Background Blobs moved inside container or kept absolute */}
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3" style={{ top: '60%', left: '70%' }}></div>
      </div>

      <div className="container" style={{ maxWidth: 900 }}>
         <header style={{ marginBottom: '6rem', textAlign: 'center' }}>
            <Link href="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '4rem', fontWeight: 600, fontSize: '0.9rem' }} className="hover-accent">
                <FiArrowLeft /> {language === 'tr' ? 'Tüm Projeler' : 'All Projects'}
            </Link>

            <h1 style={{ fontSize: 'clamp(3.5rem, 8vw, 5.5rem)', fontWeight: 950, letterSpacing: '-4px', lineHeight: 1, marginBottom: '2.5rem', color: '#fff' }}>
                {project.title}
            </h1>

            {project.tech_stack && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '4rem' }}>
                    {project.tech_stack.split(',').map((tech, idx) => (
                        <span key={idx} className="glass" style={{ padding: '0.5rem 1.25rem', borderRadius: '30px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '1px' }}>
                            {tech.trim().toUpperCase()}
                        </span>
                    ))}
                </div>
            )}
         </header>

         {project.image && (
            <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: '8rem', boxShadow: '0 60px 100px -30px rgba(0,0,0,0.8)', border: '1px solid var(--glass-border)' }}>
                <img src={pb.files.getURL(project, project.image)} alt={project.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)' }}></div>
            </div>
         )}

         <div 
            ref={contentRef}
            className="premium-rich-text" 
            dangerouslySetInnerHTML={{ __html: project.description || '' }}
            style={{ fontSize: '1.25rem', marginBottom: '8rem' }}
         />

         {project.link && (
            <div style={{ textAlign: 'center', marginBottom: '8rem' }}>
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: '1.4rem 4rem', fontSize: '1.1rem', gap: '1rem', borderRadius: '20px' }}>
                    {language === 'tr' ? 'Projeyi Keşfet' : 'Explore Project'} <FiExternalLink />
                </a>
            </div>
         )}

         {gallery.length > 0 && (
            <div style={{ marginTop: '8rem', marginBottom: '8rem' }}>
                <h4 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '3rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <FiLayout /> {language === 'tr' ? 'Proje Galerisi' : 'Project Gallery'}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                    {gallery.map((img, idx) => (
                        <div key={idx} style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', cursor: 'zoom-in', transition: 'transform 0.3s ease', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)' }} className="card-hover">
                            <img src={pb.files.getURL(project, img)} alt={`${project.title} gallery ${idx}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </div>
                    ))}
                </div>
            </div>
         )}

         <div style={{ marginTop: '10rem', paddingTop: '6rem', borderTop: '1px solid var(--glass-border)' }}>
            {/* ShareBar moved here just above comments */}
            <ShareBar isStatic={true} title={project.title} url={typeof window !== 'undefined' ? window.location.href : ''} />

            <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '4rem', textAlign: 'center' }}>
                {language === 'tr' ? 'Proje Hakkında Yorumlar' : 'Project Comments'}
            </h3>
            <GiscusComments repoId={repoId} categoryId={categoryId} />
         </div>
      </div>

      <style jsx global>{`
        .premium-rich-text pre code { padding: 0 !important; background: transparent !important; }
        .card-hover:hover { transform: scale(1.02); }
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
