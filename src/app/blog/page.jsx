'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import pb from '../../lib/pocketbase';
import { useLanguage } from '../../contexts/LanguageContext';

export default function BlogPage() {
  const { language } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const records = await pb.collection('posts').getFullList({
          sort: '-created',
        });
        setPosts(records);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      }
      setIsLoading(false);
    }
    fetchPosts();
  }, []);

  return (
    <div style={{ paddingTop: 'calc(var(--nav-height) + 4rem)', paddingBottom: '8rem' }}>
      <div className="container">
        <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 950, letterSpacing: '-2px', marginBottom: '1rem' }}>
            {language === 'tr' ? 'Blog & Yazılar' : 'Blog & Articles'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            {language === 'tr' 
              ? 'Web geliştirme, SEO ve dijital pazarlama üzerine en güncel ipuçları.' 
              : 'Latest tips on web development, SEO, and digital marketing.'}
          </p>
        </header>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <p>{language === 'tr' ? 'Yükleniyor...' : 'Loading...'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2.5rem' }}>
            {posts.length === 0 ? (
              <p style={{ gridColumn: '1/-1', textAlign: 'center', opacity: 0.5 }}>
                 {language === 'tr' ? 'Henüz yazı paylaşılmamış.' : 'No posts yet.'}
              </p>
            ) : (
              posts.map(post => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="glass card-hover" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', display: 'block', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ height: 240, overflow: 'hidden' }}>
                    {post.image ? (
                      <img src={pb.files.getURL(post, post.image)} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--accent-gradient)', opacity: 0.1 }} />
                    )}
                  </div>
                  <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.8rem', borderRadius: '20px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {post.category || 'Genel'}
                      </span>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.3 }}>{post.title}</h2>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span>{new Date(post.created).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}</span>
                       <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Oku →</span>
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
