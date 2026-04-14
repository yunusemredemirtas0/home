import pb from '../../../lib/pocketbase';
import BlogPostClient from './BlogPostClient';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  try {
    const post = await pb.collection('posts').getFirstListItem(`slug="${slug}" && status="published"`);
    
    const title = post.seo_title || post.title;
    const description = post.seo_description || post.content?.substring(0, 160).replace(/<[^>]*>/g, '');
    const keywords = post.seo_keywords || post.category || '';

    return {
      title,
      description,
      keywords: keywords.split(','),
      openGraph: {
        title,
        description,
        type: 'article',
        publishedTime: post.created,
        authors: ['Yunus Emre DEMİRTAŞ'],
        images: post.image ? [{ url: pb.files.getURL(post, post.image) }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: post.image ? [pb.files.getURL(post, post.image)] : [],
      }
    };
  } catch (error) {
    return { title: 'Yazı Bulunamadı' };
  }
}

export default async function BlogPostDetailPage({ params }) {
  const { slug } = await params;
  let post = null;

  try {
    post = await pb.collection('posts').getFirstListItem(`slug="${slug}" && status="published"`, {
      expand: 'author'
    });
  } catch (error) {
    console.error('Blog fetch error:', error);
    notFound();
  }

  return <BlogPostClient post={post} language="tr" />;
}
