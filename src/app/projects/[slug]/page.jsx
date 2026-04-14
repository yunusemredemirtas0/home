import pb from '../../../lib/pocketbase';
import ProjectClient from './ProjectClient';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  try {
    const project = await pb.collection('projects').getFirstListItem(`slug="${slug}" && status="published"`);
    
    const title = project.seo_title || project.title;
    const description = project.seo_description || project.description?.substring(0, 160).replace(/<[^>]*>/g, '');
    const keywords = project.seo_keywords || project.tech_stack || '';

    return {
      title,
      description,
      keywords: keywords.split(','),
      openGraph: {
        title,
        description,
        type: 'website',
        images: project.image ? [{ url: pb.files.getURL(project, project.image) }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: project.image ? [pb.files.getURL(project, project.image)] : [],
      }
    };
  } catch (error) {
    return { title: 'Proje Bulunamadı' };
  }
}

export default async function ProjectDetailPage({ params }) {
  const { slug } = await params;
  let project = null;

  try {
    project = await pb.collection('projects').getFirstListItem(`slug="${slug}" && status="published"`);
  } catch (error) {
    console.error('Project fetch error:', error);
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
            <p>Proje bulunamadı.</p>
            <Link href="/projects" style={{ padding: '0.75rem 1.5rem', background: 'var(--accent)', borderRadius: '8px', color: '#fff', textDecoration: 'none' }}>Projelere Geri Dön</Link>
        </div>
    );
  }

  return <ProjectClient project={project} language="tr" />;
}
