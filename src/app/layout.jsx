export const runtime = 'edge';

import './globals.css';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: 'Yunus Emre DEMİRTAŞ | Web Geliştirici & SEO Uzmanı',
  description: 'Modern, hızlı ve SEO uyumlu web deneyimleri oluşturuyoruz. İşletmenizi bir üst seviyeye taşımak için buradayım.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <Header />
              <main>{children}</main>
              <Footer />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
