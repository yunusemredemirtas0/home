'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import pb from '../../../lib/pocketbase';
import { FiArrowLeft, FiCalendar, FiTag, FiLinkedin, FiTwitter, FiGithub } from 'react-icons/fi';
import ShareBar from '../../../components/ShareBar';
import GiscusComments from '../../../components/GiscusComments';
import { trackView } from '../../../lib/analytics';

export default function BlogPostClient({ post, language }) {
  const contentRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  const repoId = "R_kgDOQ70S0w"; 
  const categoryId = "DIC_kwDOQ70S084C6xQG";

  useEffect(() => {
    setIsMounted(true);
    if (post?.id) {
        trackView('posts', post.id);
    }
    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setReadingProgress((window.scrollY / scrollHeight) * 100);
      }
    };
    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, [post?.id]);

  useEffect(() => {
    if (isMounted && post && contentRef.current) {
      import('highlight.js').then((hljs) => {
        try {
          import('highlight.js/styles/github-dark.css');
          contentRef.current.querySelectorAll('pre').forEach((block) => {
            hljs.default.highlightElement(block);
          });
        } catch (e) { console.error(e); }
      });
    }
  }, [isMounted, post]);

  const formatDate = (dateStr) => {
    if (!isMounted || !dateStr) return '';
    try {
      return new Date(dateStr.substring(0, 10)).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US');
    } catch (e) { return ''; }
  };

  if (!post) return null;

  return (
    <article style={{ paddingTop: 'calc(var(--nav-height) + 4rem)', paddingBottom: '10rem' }} className="animate-fade">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div style={{ position: 'fixed', top: 'var(--nav-height)', left: 0, width: `${readingProgress}%`, height: '4px', background: 'var(--accent-gradient)', zIndex: 100, transition: 'width 0.1s ease-out' }} />

      <div className="container" style={{ maxWidth: 850 }}>
        <header style={{ marginBottom: '5rem', textAlign: 'center' }}>
          <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '3rem', fontWeight: 600, fontSize: '0.9rem' }} className="hover-accent">
             <FiArrowLeft /> {language === 'tr' ? 'Tüm Yazılar' : 'All Articles'}
          </Link>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
             <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiCalendar style={{ color: 'var(--accent)' }} /> {formatDate(post.created)}</span>
             <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiTag style={{ color: 'var(--accent)' }} /> {post.category || 'Genel'}</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 950, letterSpacing: '-2.5px', lineHeight: 1.1, marginBottom: '3rem', color: '#fff' }}>
            {post.title}
          </h1>
          
          {post.image && (
            <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: '5rem', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6)', border: '1px solid var(--glass-border)' }}>
              <img src={pb.files.getURL(post, post.image)} alt={post.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          )}
        </header>

        <div 
          ref={contentRef}
          className="premium-rich-text" 
          dangerouslySetInnerHTML={{ __html: post.content || '' }} 
        />

        <footer style={{ marginTop: '8rem', paddingTop: '4rem', borderTop: '1px solid var(--glass-border)' }}>
           <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)', display: 'flex', gap: '2.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--accent)', padding: '4px' }}>
                 <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900, color: '#fff' }}>Y</div>
              </div>
              <div style={{ flex: 1, minWidth: '250px' }}>
                 <p style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>{language === 'tr' ? 'Yazar' : 'Author'}</p>
                 <h4 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.75rem', color: '#fff' }}>Yunus Emre DEMİRTAŞ</h4>
                 <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{language === 'tr' ? 'Web Geliştirici & Tasarımcı. Dijital dünyada estetik ve performansı birleştiren deneyimler inşa ediyorum.' : 'Web Developer & Designer. Building experiences that combine aesthetics and performance in the digital world.'}</p>
                 <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1.5rem' }}>
                    <a href="https://linkedin.com" target="_blank" className="hover-accent" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}><FiLinkedin /></a>
                    <a href="https://twitter.com" target="_blank" className="hover-accent" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}><FiTwitter /></a>
                    <a href="https://github.com" target="_blank" className="hover-accent" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}><FiGithub /></a>
                 </div>
              </div>
           </div>

           <div style={{ marginTop: '6rem' }}>
              <ShareBar isStatic={true} title={post.title} url={typeof window !== 'undefined' ? window.location.href : ''} />

              <h3 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '3.5rem', color: '#fff', textAlign: 'center' }}>
                 {language === 'tr' ? 'Yazı Hakkında Yorumlar' : 'Comments'}
              </h3>
              <GiscusComments repoId={repoId} categoryId={categoryId} />
           </div>
        </footer>
      </div>

      <style jsx global>{`
        .premium-rich-text pre code { padding: 0 !important; background: transparent !important; }
      `}</style>
    </article>
  );
}
