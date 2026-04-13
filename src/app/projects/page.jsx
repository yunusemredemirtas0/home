'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import pb from '../../lib/pocketbase';
import { useLanguage } from '../../contexts/LanguageContext';
import { FiExternalLink, FiCode } from 'react-icons/fi';

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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '3rem' }}>
            {projects.length === 0 ? (
              <p style={{ gridColumn: '1/-1', textAlign: 'center', opacity: 0.5 }}>
                 {language === 'tr' ? 'Henüz proje eklenmemiş.' : 'No projects added yet.'}
              </p>
            ) : (
              projects.map(project => (
                <div key={project.id} className="glass card-hover" style={{ borderRadius: 'var(--radius-2xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', height: 300, overflow: 'hidden' }}>
                    {project.image ? (
                      <img src={pb.files.getURL(project, project.image)} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--accent-gradient)', opacity: 0.1 }} />
                    )}
                    {project.link && (
                       <a href={project.link} target="_blank" rel="noopener noreferrer" className="glass" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#fff' }}>
                          <FiExternalLink />
                       </a>
                    )}
                  </div>
                  <div style={{ padding: '2.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                      {project.tech_stack?.split(',').map((tech, i) => (
                        <span key={i} style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)' }}>
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 850, marginBottom: '1rem' }}>{project.title}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem', flex: 1 }}>{project.description}</p>
                    
                    {/* Link to detail could be added here if needed, but for now external link is good */}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
