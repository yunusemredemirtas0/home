import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { FiMoon, FiSun, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';

export default function Header() {
    const { theme, toggleTheme } = useTheme();
    const { language, toggleLanguage, t } = useLanguage();
    const { currentUser, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = (id) => {
        setMenuOpen(false); // Close mobile menu if open
        // If we are on the home page, scroll to section
        if (location.pathname === '/') {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // If not on home page, navigate home then scroll
            navigate('/');
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch {
            console.error("Failed to log out");
        }
    };

    return (
        <header style={{
            position: 'fixed',
            top: '20px',
            left: 0,
            right: 0,
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            padding: '0 1rem',
            transition: 'all 0.3s ease',
            transform: scrolled ? 'translateY(0)' : 'translateY(10px)',
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem 1rem',
                width: '100%',
                maxWidth: '1000px',
                background: 'transparent',
                backdropFilter: 'none',
                border: 'none',
                boxShadow: 'none'
            }}>
                <div onClick={() => handleNavClick('home')} style={{ cursor: 'pointer' }}>
                    <Logo />
                </div>

                <nav style={{ display: 'none', md: { display: 'block' } }}>
                    <ul style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        {['home', 'about', 'services', 'projects', 'contact'].map((item) => {
                            const targetId = item === 'services' ? 'projects' : item;

                            return (
                                <li key={item} className="nav-item">
                                    <button
                                        onClick={() => handleNavClick(targetId)}
                                        style={{
                                            fontSize: '0.95rem',
                                            color: 'var(--text-secondary)',
                                            fontWeight: '600',
                                            transition: 'color 0.2s',
                                            textTransform: 'capitalize'
                                        }}
                                        onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'}
                                        onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
                                    >
                                        {t.nav[item] || item}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {/* User Auth Section */}
                    {currentUser ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
                            <div
                                onClick={() => navigate('/dashboard')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '20px',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}>
                                {currentUser.photoURL ? (
                                    <img
                                        src={currentUser.photoURL}
                                        alt="Profile"
                                        style={{ width: '20px', height: '20px', borderRadius: '50%' }}
                                    />
                                ) : (
                                    <FiUser />
                                )}
                                <span>{currentUser.displayName || currentUser.email.split('@')[0]}</span>
                            </div>
                            <button onClick={handleLogout} style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }} title="Logout">
                                <FiLogOut />
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => navigate('/login')} style={{
                            padding: '0.6rem 1.2rem',
                            borderRadius: '20px',
                            border: '1px solid var(--accent-color)',
                            background: 'rgba(124, 58, 237, 0.1)',
                            color: 'var(--accent-color)',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            marginRight: '0.5rem',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                        }}
                            onMouseOver={(e) => {
                                e.target.style.background = 'var(--accent-color)';
                                e.target.style.color = 'white';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.background = 'rgba(124, 58, 237, 0.1)';
                                e.target.style.color = 'var(--accent-color)';
                            }}
                        >
                            {language === 'tr' ? 'Giriş' : 'Login'}
                        </button>
                    )}

                    <button onClick={toggleLanguage} style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--border-color)',
                        transition: 'all 0.2s'
                    }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-color)'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                        <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>
                            {language === 'tr' ? 'EN' : 'TR'}
                        </span>
                    </button>

                    <button onClick={toggleTheme} style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--bg-secondary)',
                        color: theme === 'light' ? '#fbbf24' : 'var(--text-primary)',
                        fontSize: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--border-color)',
                        transition: 'all 0.2s'
                    }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-color)'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                        {theme === 'light' ? <FiMoon /> : <FiSun />}
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-only"
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{
                        fontSize: '1.5rem',
                        color: 'var(--text-primary)',
                        marginLeft: '1rem',
                        zIndex: 1002
                    }}
                >
                    {menuOpen ? <FiX /> : <FiMenu />}
                </button>

                {/* Mobile Menu Overlay */}
                {menuOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'var(--bg-primary)',
                        zIndex: 1001,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem'
                    }}>
                        <ul style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2rem',
                            alignItems: 'center',
                            marginBottom: '2rem'
                        }}>
                            {['home', 'about', 'services', 'projects', 'contact'].map((item) => {
                                const targetId = item === 'services' ? 'projects' : item;
                                return (
                                    <li key={item}>
                                        <button
                                            onClick={() => handleNavClick(targetId)}
                                            style={{
                                                fontSize: '1.5rem',
                                                color: 'var(--text-primary)',
                                                fontWeight: '600',
                                                textTransform: 'capitalize'
                                            }}
                                        >
                                            {t.nav[item] || item}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>

            <style>{`
        @media (max-width: 900px) {
          .nav-item { display: none; }
        }
        @media (min-width: 901px) {
          .nav-item { display: block; }
        }
      `}</style>
        </header>
    );
}
