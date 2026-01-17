import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from './Header';
import {
    FiHome, FiBox, FiLifeBuoy, FiSettings, FiLogOut,
    FiActivity, FiFileText, FiUser, FiMenu, FiX, FiCheckCircle, FiClock
} from 'react-icons/fi';
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

export default function Dashboard() {
    const { t, language } = useLanguage();
    const { currentUser, logout } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Settings State
    const [displayName, setDisplayName] = useState('');
    const [statusMsg, setStatusMsg] = useState({ type: '', msg: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        } else {
            setDisplayName(currentUser.displayName || '');
        }
    }, [currentUser, navigate]);

    if (!currentUser) return null;

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch {
            console.error("Failed to log out");
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile(auth.currentUser, { displayName });
            setStatusMsg({ type: 'success', msg: t.dashboard.settings.success });
        } catch (error) {
            setStatusMsg({ type: 'error', msg: t.dashboard.settings.error });
        }
        setLoading(false);
    };

    const handlePasswordReset = async () => {
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, currentUser.email);
            setStatusMsg({ type: 'success', msg: t.dashboard.settings.success });
        } catch (error) {
            setStatusMsg({ type: 'error', msg: t.dashboard.settings.error });
        }
        setLoading(false);
    };

    const SidebarItem = ({ id, icon, label, danger = false }) => (
        <button
            onClick={() => {
                if (id === 'logout') handleLogout();
                else {
                    setActiveTab(id);
                    setMobileMenuOpen(false);
                }
            }}
            style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: activeTab === id ? 'var(--accent-gradient)' : 'transparent',
                color: danger ? '#ef4444' : (activeTab === id ? 'white' : 'var(--text-secondary)'),
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: activeTab === id ? '600' : '500',
                marginTop: id === 'logout' ? 'auto' : '0',
                transition: 'all 0.2s'
            }}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    const StatCard = ({ title, value, icon, color }) => (
        <div className="glass" style={{
            padding: '1.5rem',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            border: '1px solid rgba(255,255,255,0.05)'
        }}>
            <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: `rgba(${color}, 0.1)`,
                color: `rgb(${color})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{title}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>{value}</div>
            </div>
        </div>
    );

    // Content Components
    const Overview = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <StatCard title={t.dashboard.overview.activeServices} value="1" icon={<FiBox />} color="16, 185, 129" />
                <StatCard title={t.dashboard.overview.openTickets} value="0" icon={<FiLifeBuoy />} color="59, 130, 246" />
                <StatCard title={t.dashboard.overview.totalInvoices} value="$0.00" icon={<FiFileText />} color="245, 158, 11" />
            </div>

            <div className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{t.dashboard.overview.quickActions}</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button onClick={() => setActiveTab('support')} style={{
                        padding: '0.8rem 1.5rem',
                        borderRadius: '12px',
                        background: 'var(--accent-gradient)',
                        color: 'white',
                        border: 'none',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}>
                        + {t.dashboard.overview.newTicket}
                    </button>
                    <button onClick={() => setActiveTab('services')} style={{
                        padding: '0.8rem 1.5rem',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}>
                        {t.dashboard.overview.browseServices}
                    </button>
                </div>
            </div>
        </div>
    );

    const Services = () => (
        <div className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{t.dashboard.services.title}</h2>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{t.dashboard.services.serviceName}</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{t.dashboard.services.startDate}</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{t.dashboard.services.status}</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '1rem' }}>
                                <div style={{ fontWeight: '600' }}>Premium Hosting - Starter</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>mysite.com</div>
                            </td>
                            <td style={{ padding: '1rem' }}>Jan 15, 2024</td>
                            <td style={{ padding: '1rem' }}>
                                <span style={{
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    color: '#10b981',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600'
                                }}>
                                    {t.dashboard.services.active}
                                </span>
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                <button style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer'
                                }}>
                                    {t.dashboard.services.manage}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );

    const Support = () => (
        <div className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{t.dashboard.support.title}</h2>
                <button style={{
                    padding: '0.8rem 1.5rem',
                    borderRadius: '12px',
                    background: 'var(--accent-gradient)',
                    color: 'white',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer'
                }}>
                    {t.dashboard.support.createTicket}
                </button>
            </div>

            <div style={{
                padding: '3rem',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '16px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem'
            }}>
                <FiLifeBuoy size={48} style={{ opacity: 0.3 }} />
                <p>{t.dashboard.support.noTickets}</p>
            </div>
        </div>
    );

    const Settings = () => (
        <div style={{ maxWidth: '600px' }}>
            <div className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{t.dashboard.settings.profile}</h2>

                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{t.dashboard.settings.email}</label>
                        <input type="email" value={currentUser.email} disabled style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', cursor: 'not-allowed' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{t.dashboard.settings.displayName}</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                        />
                    </div>
                    <button type="submit" disabled={loading} style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        background: 'var(--accent-gradient)',
                        color: 'white',
                        border: 'none',
                        fontWeight: '700',
                        cursor: loading ? 'wait' : 'pointer'
                    }}>
                        {t.dashboard.settings.updateProfile}
                    </button>
                </form>
            </div>

            <div className="glass" style={{ padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{t.dashboard.settings.security}</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{t.dashboard.settings.passwordResetTo} <strong>{currentUser.email}</strong></p>
                <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={loading}
                    style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontWeight: '600',
                        cursor: loading ? 'wait' : 'pointer'
                    }}>
                    {t.dashboard.settings.sendResetLink}
                </button>
            </div>

            {statusMsg.msg && (
                <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: statusMsg.type === 'success' ? '#10b981' : '#ef4444',
                    textAlign: 'center'
                }}>
                    {statusMsg.msg}
                </div>
            )}
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex' }}>
            {/* Background Gradients */}
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                background: 'radial-gradient(circle at 10% 20%, rgba(124, 58, 237, 0.05) 0%, transparent 40%)',
                pointerEvents: 'none', zIndex: 0
            }}></div>

            {/* Mobile Header */}
            <div style={{
                display: 'none',
                // We'll use media query styles at bottom to show this on mobile
                width: '100%', padding: '1rem', alignItems: 'center', justifyContent: 'space-between',
                position: 'fixed', top: 0, left: 0, zIndex: 100, background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)'
            }} className="mobile-header">
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Client Portal</div>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.5rem' }}>
                    {mobileMenuOpen ? <FiX /> : <FiMenu />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`} style={{
                width: '280px',
                height: '100vh',
                position: 'fixed',
                left: 0, top: 0,
                background: 'rgba(20, 20, 20, 0.95)',
                borderRight: '1px solid var(--border-color)',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 90,
                transition: 'transform 0.3s ease'
            }}>
                {/* Logo Area */}
                <div style={{
                    marginBottom: '3rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    cursor: 'pointer'
                }} onClick={() => navigate('/')}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: 'var(--accent-gradient)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 'bold'
                    }}>YD</div>
                    <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>{t.dashboard.title}</span>
                </div>

                {/* User Mini Profile */}
                <div style={{ marginBottom: '2rem', padding: '1rem', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt="User" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                    ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                            <FiUser />
                        </div>
                    )}
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.displayName || 'User'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.email}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <SidebarItem id="overview" icon={<FiHome />} label={t.dashboard.tabs.overview} />
                    <SidebarItem id="services" icon={<FiBox />} label={t.dashboard.tabs.services} />
                    <SidebarItem id="support" icon={<FiLifeBuoy />} label={t.dashboard.tabs.support} />
                    <SidebarItem id="settings" icon={<FiSettings />} label={t.dashboard.tabs.settings} />
                </div>

                <SidebarItem id="logout" icon={<FiLogOut />} label={t.dashboard.tabs.logout} danger />
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                marginLeft: '280px',
                padding: '3rem',
                paddingTop: '3rem', // Add top padding for mobile header
                minHeight: '100vh',
                transition: 'margin 0.3s ease'
            }} className="main-content">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                        {t.dashboard.tabs[activeTab]}
                    </h1>
                    <button onClick={() => navigate('/')} style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer'
                    }}>
                        &larr; {language === 'tr' ? 'Siteye Dön' : 'Back to Site'}
                    </button>
                </header>

                {activeTab === 'overview' && <Overview />}
                {activeTab === 'services' && <Services />}
                {activeTab === 'support' && <Support />}
                {activeTab === 'settings' && <Settings />}
            </main>

            <style>{`
            @media (max-width: 900px) {
                .sidebar { transform: translateX(-100%); width: 260px; }
                .sidebar.open { transform: translateX(0); }
                .main-content { margin-left: 0; padding: 1.5rem; padding-top: 5rem; }
                .mobile-header { display: flex !important; }
            }
        `}</style>
        </div>
    );
}
