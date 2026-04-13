'use client';
import { useState, useEffect, use, useRef } from 'react';
import Link from 'next/link';
import pb from '../../../lib/pocketbase';
import { useLanguage } from '../../../contexts/LanguageContext';
import { FiArrowLeft, FiCalendar, FiTag, FiUser, FiShare2, FiClock } from 'react-icons/fi';
import dynamic from 'next/dynamic';

// Import highlight.js dynamically to avoid SSR issues
const BlogPostDetailContent = ({ post, language }) => {
  const contentRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && post && contentRef.current) {
      import('highlight.js').then((hljs) => {
        import('highlight.js/styles/github-dark.css');
        contentRef.current.querySelectorAll('pre').forEach((block) => {
          hljs.default.highlightElement(block);
        });
      });
    }
  }, [isMounted, post]);

  const formatDate = (dateStr) => {
    if (!isMounted || !dateStr) return '';
    try {
      return new Date(dateStr.substring(0, 10)).toLocaleDateString();
    } catch (e) {
      return '';
    }
  };

  return (
    <article style={{ paddingTop: 'calc(var(--nav-height) + 2rem)', paddingBottom: '10rem' }} className="animate-fade">
      <div style={{ position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '60%', background: 'var(--accent)', filter: 'blur(150px)', opacity: 0.05, pointerEvents: 'none', zIndex: -1 }}></div>

      <div className="container" style={{ maxWidth: 900 }}>
        <header style={{ marginBottom: '5rem' }}>
          <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '4rem', fontWeight: 600, fontSize: '0.95rem', transition: 'var(--transition)' }} className="hover-accent">
             <FiArrowLeft /> {language === 'tr' ? 'Tüm Yazılar' : 'All Articles'}
          </Link>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '2.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>
             <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiCalendar style={{ color: 'var(--accent)' }} /> {formatDate(post.created)}</span>
             <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiTag style={{ color: 'var(--accent)' }} /> {post.category || 'Genel'}</span>
             {post.expand?.author && <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiUser style={{ color: 'var(--accent)' }} /> {post.expand.author.name}</span>}
          </div>

          <h1 style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', fontWeight: 950, letterSpacing: '-3px', lineHeight: 1.05, marginBottom: '3rem', color: '#fff' }}>
            {post.title}
          </h1>
          
          {post.image && (
            <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: '5rem', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6)', border: '1px solid var(--glass-border)' }}>
              <img src={pb.files.getURL(post, post.image)} alt={post.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }}></div>
            </div>
          )}
        </header>

        <div 
          ref={contentRef}
          className="premium-rich-text" 
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />

        <footer style={{ marginTop: '8rem', borderTop: '1px solid var(--glass-border)', paddingTop: '4rem' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                 <button className="glass" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link kopyalandı!'); }}>
                    <FiShare2 /> {language === 'tr' ? 'Paylaş' : 'Share'}
                 </button>
              </div>
           </div>

           <div className="glass" style={{ marginTop: '5rem', padding: '4rem', borderRadius: 'var(--radius-xl)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'var(--accent)', filter: 'blur(100px)', opacity: 0.1 }}></div>
              <h3 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1.5rem', color: '#fff' }}>{language === 'tr' ? 'Daha Fazla Soru?' : 'Got More Questions?'}</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>{language === 'tr' ? 'Projeleriniz için işbirliği yapmak veya sadece merhaba demek isterseniz her zaman buradayım.' : 'Whether you want to collaborate on projects or just say hello, I\'m always here.'}</p>
              <Link href="/#contact" className="btn-primary" style={{ padding: '1rem 3rem' }}>{language === 'tr' ? 'Benimle İletişime Geç' : 'Get in Touch'}</Link>
           </div>
        </footer>

        <style jsx global>{`
          .hover-accent:hover { color: var(--accent) !important; transform: translateX(-5px); }
          .premium-rich-text pre code { padding: 0 !important; background: transparent !important; }
        `}</style>
      </div>
    </article>
  );
};

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

  if (isLoading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>Yükleniyor...</p></div>;
  if (!post) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>Yazı bulunamadı.</p></div>;

  return <BlogPostDetailContent post={post} language={language} />;
}
