'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import pb from '../../lib/pocketbase';
import { useLanguage } from '../../contexts/LanguageContext';
import { FiExternalLink } from 'react-icons/fi';

export default function ProjectsPage() {
  const { t } = useLanguage();
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
    <div style={{ paddingTop: 'calc(var(--nav-height) + clamp(2rem, 5vw, 4rem))', paddingBottom: 'var(--section-padding)' }}>
      <div className="container">
        <header style={{ marginBottom: 'clamp(3rem, 8vw, 5rem)', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'var(--h1-size)', fontWeight: 950, letterSpacing: '-2px', marginBottom: '1rem' }}>
            {t?.projects?.title}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', maxWidth: '700px', margin: '0 auto' }}>
            {t?.projects?.subtitle}
          </p>
        </header>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <p>{t?.projects?.loading}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 380px), 1fr))', gap: 'clamp(1.5rem, 4vw, 3rem)' }}>
            {projects.length === 0 ? (
              <p style={{ gridColumn: '1/-1', textAlign: 'center', opacity: 0.5 }}>
                 {t?.projects?.noPosts}
              </p>
            ) : (
              projects.map(project => (
                <Link key={project.id} href={`/projects/${project.slug}`} className="glass card-hover" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ height: 'clamp(200px, 30vw, 260px)', overflow: 'hidden', position: 'relative' }}>
                    {project.image ? (
                      <img src={pb.files.getURL(project, project.image)} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--accent-gradient)', opacity: 0.1 }} />
                    )}
                    <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'var(--accent)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '30px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {project.tech_stack?.split(',')[0]}
                    </div>
                  </div>
                  <div style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.75rem)', fontWeight: 850, marginBottom: '0.75rem', lineHeight: 1.2 }}>{project.title}</h3>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }} dangerouslySetInnerHTML={{ __html: project.description }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)', marginTop: 'auto' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--accent)', letterSpacing: '1px' }}>{t?.projects?.details}</span>
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
