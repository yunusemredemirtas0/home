'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import pb from '../../lib/pocketbase';
import { useLanguage } from '../../contexts/LanguageContext';
import { FiExternalLink } from 'react-icons/fi';

export default function ProjectsPage() {
  const { language } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const records = await pb.collection('projects').getFullList({
          filter: 'status = "published"'
        });
        setProjects(records);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
      setIsLoading(false);
    }
    fetchProjects();
  }, []);

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 4rem)', paddingBottom: '8rem' }}>
      <div className="container">
        <header style={{ marginBottom: '5rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '4rem', fontWeight: 950, letterSpacing: '-2px', marginBottom: '1rem' }}>
            {language === 'tr' ? 'Projelerim' : 'My Projects'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto' }}>
            {language === 'tr' 
              ? 'Tasarladığım ve geliştirdiğim en yeni dijital deneyimler.' 
              : 'The latest digital experiences I have designed and developed.'}
          </p>
        </header>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <p>{language === 'tr' ? 'Yükleniyor...' : 'Loading...'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '3rem' }}>
            {projects.length === 0 ? (
              <p style={{ gridColumn: '1/-1', textAlign: 'center', opacity: 0.5 }}>
                 {language === 'tr' ? 'Henüz proje eklenmemiş.' : 'No projects added yet.'}
              </p>
            ) : (
              projects.map(project => (
                <Link key={project.id} href={`/projects/${project.slug}`} className="glass card-hover" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'block', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ height: 240, overflow: 'hidden', position: 'relative' }}>
                    {project.image ? (
                      <img src={pb.files.getURL(project, project.image)} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--accent-gradient)', opacity: 0.1 }} />
                    )}
                    <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', background: 'var(--accent)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '30px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {project.tech_stack?.split(',')[0]}
                    </div>
                  </div>
                  <div style={{ padding: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 850, marginBottom: '1rem', lineHeight: 1.2 }}>{project.title}</h3>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: project.description }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--accent)', letterSpacing: '1px' }}>DETAYLARI GÖR →</span>
                        <FiExternalLink style={{ opacity: 0.3 }} />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
