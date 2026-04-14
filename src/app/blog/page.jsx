'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import pb from '../../lib/pocketbase';
import { useLanguage } from '../../contexts/LanguageContext';

export default function BlogPage() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    async function fetchPosts() {
      try {
        const records = await pb.collection('posts').getFullList({
          filter: 'status = "published"'
        });
        setPosts(records);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      }
      setIsLoading(false);
    }
    fetchPosts();
  }, []);

  const formatDate = (dateStr) => {
    if (!isMounted || !dateStr) return '';
    try {
      return new Date(dateStr.substring(0, 10)).toLocaleDateString();
    } catch (e) {
      return '';
    }
  };

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + clamp(2rem, 5vw, 4rem))', paddingBottom: 'var(--section-padding)' }}>
      <div className="container">
        <header style={{ marginBottom: 'clamp(2.5rem, 6vw, 4rem)', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'var(--h1-size)', fontWeight: 950, letterSpacing: '-2px', marginBottom: '1rem' }}>
            {t?.blog?.title}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', maxWidth: '600px', margin: '0 auto' }}>
            {t?.blog?.subtitle}
          </p>
        </header>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <p>{t?.blog?.loading}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
            {posts.length === 0 ? (
              <p style={{ gridColumn: '1/-1', textAlign: 'center', opacity: 0.5 }}>
                 {t?.blog?.noPosts}
              </p>
            ) : (
              posts.map(post => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="glass card-hover" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'block', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ height: 'clamp(180px, 25vw, 240px)', overflow: 'hidden' }}>
                    {post.image ? (
                      <img src={pb.files.getURL(post, post.image)} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--accent-gradient)', opacity: 0.1 }} />
                    )}
                  </div>
                  <div style={{ padding: 'clamp(1.5rem, 4vw, 2rem)' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.3rem 0.8rem', borderRadius: '20px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {post.category || 'Genel'}
                      </span>
                    </div>
                    <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.3 }}>{post.title}</h2>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span>{formatDate(post.created)}</span>
                       <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t?.blog?.readMore}</span>
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
