export const runtime = 'edge';

import './globals.css';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Script from 'next/script';

export const metadata = {
  metadataBase: new URL('https://yunusemredemirtas.com'),
  title: {
    default: 'Yunus Emre DEMİRTAŞ | Full Stack Web & Mobil Geliştirici',
    template: '%s | Yunus Emre DEMİRTAŞ'
  },
  description: 'Modern Web, Mobil Uygulamalar ve Ölçeklenebilir Backend Çözümleri. Dijital vizyonunuzu profesyonel mühendislik ile gerçeğe dönüştürüyorum.',
  keywords: ['Yunus Emre DEMİRTAŞ', 'Full Stack Developer', 'Mobil Uygulama Geliştirici', 'Next.js Geliştirici', 'React Native Developer', 'Backend Mimarisi'],
  authors: [{ name: 'Yunus Emre DEMİRTAŞ' }],
  creator: 'Yunus Emre DEMİRTAŞ',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://yunusemredemirtas.com',
    siteName: 'Yunus Emre DEMİRTAŞ',
    title: 'Yunus Emre DEMİRTAŞ | Full Stack Web & Mobil Geliştirici',
    description: 'Modern Web ve Mobil Uygulama Çözümleri.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Yunus Emre DEMİRTAŞ' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yunus Emre DEMİRTAŞ | Full Stack Web & Mobil Geliştirici',
    description: 'Modern web ve mobil deneyimleri.',
    creator: '@yunusemredemirtas',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-id',
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Yunus Emre DEMİRTAŞ",
    "image": "https://yunusemredemirtas.com/og-image.jpg",
    "description": "Modern Web, Mobil Uygulamalar ve Ölçeklenebilir Backend Çözümleri oluşturan Full Stack Geliştirici.",
    "url": "https://yunusemredemirtas.com",
    "telephone": "",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Trabzon",
      "addressCountry": "TR"
    },
    "sameAs": [
      "https://github.com/yunusemredemirtas0",
      "https://tr.linkedin.com/in/yunusemredemirtas0",
      "https://www.instagram.com/yunuus.ed61/"
    ]
  };

  return (
    <html lang="tr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Script 
          defer 
          src="https://umami.yunusemredemirtas.com/analytics" 
          data-website-id="dfd0b8ee-5acc-42ea-bfea-7cf446a7ca99" 
        />
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <Header />
              <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <main style={{ flex: 1 }}>{children}</main>
                <Footer />
              </div>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
