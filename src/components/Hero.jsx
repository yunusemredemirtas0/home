import { useLanguage } from '../contexts/LanguageContext';
import { FaGithub, FaLinkedin, FaInstagram, FaTwitter } from 'react-icons/fa';

export default function Hero() {
    const { t } = useLanguage();

    return (
        <section id="home" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '120px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Glow Elements */}
            <div style={{
                position: 'absolute',
                top: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                transform: 'translateX(-50%)',
                width: 'min(600px, 90vw)',
                height: 'min(600px, 90vw)',
                background: 'radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 70%)',
                filter: 'blur(60px)',
                zIndex: -1
            }}></div>

            <div className="glass" style={{
                padding: '3rem',
                borderRadius: '40px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                textAlign: 'center',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'var(--accent-gradient)',
                    margin: '0 auto 1.5rem auto',
                    padding: '4px',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                }}>
                    <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Yunus&backgroundColor=b6e3f4"
                        alt="Profile"
                        style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#fff' }}
                    />
                </div>

                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    marginBottom: '0.5rem',
                    fontFamily: "'Times New Roman', serif" // Mimicking the serif font in the image
                }}>
                    Yunus Emre DEMİRTAŞ
                </h1>

                <p style={{
                    fontSize: '1rem',
                    color: 'var(--text-primary)',
                    marginBottom: '0.5rem',
                    opacity: 0.9
                }}>
                    Web Developer
                </p>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginBottom: '2rem',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem'
                }}>
                    <span>📍</span> Kocaeli, Türkiye
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    {[FaGithub, FaTwitter, FaInstagram, FaLinkedin].map((Icon, i) => (
                        <a key={i} href="#" style={{
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.2rem',
                            border: '1px solid rgba(255,255,255,0.1)',
                            transition: 'transform 0.2s, background 0.2s'
                        }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.background = 'var(--accent-gradient)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))';
                            }}
                        >
                            <Icon />
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
