import { useLanguage } from '../contexts/LanguageContext';

export default function About() {
    const { t } = useLanguage();

    return (
        <section id="about" style={{ background: 'var(--bg-secondary)', padding: '6rem 0' }}>
            <div className="container">
                <h2 style={{
                    fontSize: '2.5rem',
                    marginBottom: '2rem',
                    textAlign: 'center',
                    fontWeight: '800',
                    background: 'var(--accent-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    {t.about.title}
                </h2>

                <div className="glass" style={{
                    padding: '3rem',
                    borderRadius: '30px',
                    maxWidth: '900px',
                    margin: '0 auto',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    <p style={{
                        fontSize: '1.2rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.8,
                        marginBottom: '2rem',
                        textAlign: 'center'
                    }}>
                        {t.about.description}
                    </p>

                    <ul style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        textAlign: 'left',
                        paddingLeft: '1rem'
                    }}>
                        {t.about.competencies && t.about.competencies.map((item, index) => (
                            <li key={index} style={{
                                fontSize: '1.1rem',
                                color: 'var(--text-primary)',
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: '0.8rem'
                            }}>
                                <span style={{ color: 'var(--accent-color)', fontSize: '1.2rem' }}>•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
