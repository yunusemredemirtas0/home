import { useLanguage } from '../contexts/LanguageContext';
import { FiMonitor, FiSmartphone, FiCodepen } from 'react-icons/fi';

// Define icons map to match IDs from translation
const iconMap = {
    1: <FiMonitor />,
    2: <FiSmartphone />,
    3: <FiCodepen />
};

const colorMap = {
    1: 'linear-gradient(135deg, #FF6B6B 0%, #EE5D5D 100%)',
    2: 'linear-gradient(135deg, #4ECDC4 0%, #2BCBBA 100%)',
    3: 'linear-gradient(135deg, #45B7D1 0%, #2D98DA 100%)'
};

export default function Projects() {
    const { t } = useLanguage();

    return (
        <section id="projects" style={{ background: 'var(--bg-secondary)', padding: '6rem 0' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        marginBottom: '1rem',
                        background: 'var(--accent-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        {t.projects.title}
                    </h2>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem',
                    justifyItems: 'center' // Center items if they don't fill width
                }}>
                    {t.projects.items.map((project) => (
                        <div key={project.id} className="glass" style={{
                            borderRadius: '24px',
                            overflow: 'hidden',
                            transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: '350px',
                            width: '100%',
                            maxWidth: '380px', // Standardize max width for uniform look
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                        }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{
                                height: '180px', // Fixed height for visual consistency
                                background: colorMap[project.id],
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                                color: 'white',
                                fontSize: '4rem'
                            }}>
                                {/* Decorative Circle */}
                                <div style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    transform: 'skewY(-10deg) translateY(50%)',
                                }}></div>
                                <div style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>
                                    {iconMap[project.id]}
                                </div>
                            </div>

                            <div style={{
                                padding: '2rem',
                                background: 'var(--card-bg)',
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.8rem' }}>{project.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem', flex: 1 }}>{project.desc}</p>
                                <button style={{
                                    color: 'var(--text-primary)',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.9rem',
                                    opacity: 0.8,
                                    alignSelf: 'flex-start'
                                }}>
                                    {t.projects.viewProject} &rarr;
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
