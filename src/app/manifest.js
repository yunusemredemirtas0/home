export const runtime = 'edge';

export default function manifest() {
  return {
    name: 'Yunus Emre DEMİRTAŞ',
    short_name: 'Yunus Emre',
    description: 'Modern, hızlı ve SEO uyumlu web deneyimleri.',
    start_url: '/',
    display: 'standalone',
    background_color: '#050508',
    theme_color: '#7c3aed',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
