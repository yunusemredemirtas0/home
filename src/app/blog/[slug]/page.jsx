'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import pb from '../../../lib/pocketbase';
import { useLanguage } from '../../../contexts/LanguageContext';
import { FiArrowLeft, FiCalendar, FiTag, FiUser } from 'react-icons/fi';

export default function BlogPostDetail({ params }) {
  const { slug } = use(params);
  const { language } = useLanguage();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const record = await pb.collection('posts').getFirstListItem(`slug="${slug}" && status="published"`, {
          expand: 'author'
        });
        setPost(record);
      } catch (error) {
        console.error('Error fetching post:', error);
      }
      setIsLoading(false);
    }
    fetchPost();
  }, [slug]);

  if (isLoading) return <div style={{ paddingTop: '10rem', textAlign: 'center' }}>Yükleniyor...</div>;
  if (!post) return <div style={{ paddingTop: '10rem', textAlign: 'center' }}>Yazı bulunamadı. <Link href="/blog">Geri dön</Link></div>;

  return (
    <article style={{ paddingTop: 'calc(var(--nav-height) + 4rem)', paddingBottom: '8rem' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <Link href="/blog" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '3rem', fontWeight: 600 }}>
           <FiArrowLeft /> {language === 'tr' ? 'Blog\'a Dön' : 'Back to Blog'}
        </Link>

        <header style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
             <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FiCalendar /> {new Date(post.created).toLocaleDateString()}</span>
             <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FiTag /> {post.category || 'Genel'}</span>
             {post.expand?.author && <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FiUser /> {post.expand.author.name}</span>}
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 950, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: '2.5rem' }}>{post.title}</h1>
          
          {post.image && (
            <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: '4rem', boxShadow: '0 30px 60px -10px rgba(0,0,0,0.3)' }}>
              <img src={pb.files.getURL(post, post.image)} alt={post.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          )}
        </header>

        <div 
          className="blog-content" 
          dangerouslySetInnerHTML={{ __html: post.content }} 
          style={{ 
            fontSize: '1.15rem', 
            lineHeight: 1.8, 
            color: 'var(--text-primary)',
          }}
        />

        <hr style={{ margin: '5rem 0', borderColor: 'var(--glass-border)', opacity: 0.1 }} />
        
        <div className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)', textAlign: 'center' }}>
           <h3 style={{ marginBottom: '1rem' }}>{language === 'tr' ? 'Bu yazı hoşunuza gitti mi?' : 'Did you like this article?'}</h3>
           <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{language === 'tr' ? 'Benzer içeriklerden haberdar olmak için takipte kalın.' : 'Stay tuned for more similar content.'}</p>
           <Link href="/#contact" className="btn-primary" style={{ display: 'inline-block' }}>{language === 'tr' ? 'Benimle İletişime Geç' : 'Contact Me'}</Link>
        </div>
      </div>

      <style jsx global>{`
        .blog-content h2 { font-size: 2rem; margin: 3rem 0 1.5rem; font-weight: 800; }
        .blog-content h3 { font-size: 1.5rem; margin: 2rem 0 1rem; font-weight: 700; }
        .blog-content p { margin-bottom: 1.5rem; }
        .blog-content ul, .blog-content ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
        .blog-content li { margin-bottom: 0.5rem; }
        .blog-content img { max-width: 100%; height: auto; border-radius: 12px; margin: 2rem 0; }
        .blog-content blockquote { border-left: 4px solid var(--accent); padding-left: 1.5rem; font-style: italic; color: var(--text-secondary); margin: 2rem 0; }
        .blog-content pre { background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 12px; overflow-x: auto; margin: 2rem 0; font-family: 'Fira Code', monospace; font-size: 0.9rem; }
      `}</style>
    </article>
  );
}
