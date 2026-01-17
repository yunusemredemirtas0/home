import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
    const { t } = useLanguage();
    const year = new Date().getFullYear();

    return (
        <footer style={{
            padding: '3rem 0',
            textAlign: 'center',
            borderTop: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            background: 'var(--bg-primary)'
        }}>
            <div className="container">
                <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    marginBottom: '0.5rem',
                    background: 'var(--accent-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block'
                }}>
                    Yunus Emre DEMİRTAŞ
                </h3>
                <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '1rem' }}>
                    &copy; {year} {t.footer.rights}
                </p>
            </div>
        </footer>
    );
}
