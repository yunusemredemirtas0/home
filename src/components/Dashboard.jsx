import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
    FiHome, FiBox, FiLifeBuoy, FiSettings, FiLogOut,
    FiActivity, FiFileText, FiUser, FiMenu, FiX, FiShield, FiPlus, FiMessageSquare,
    FiSun, FiMoon, FiArrowLeft, FiLayers, FiBell, FiLock, FiSmartphone, FiMonitor, FiPalette as PaletteIcon, FiZap,
    FiServer
} from 'react-icons/fi';
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { createTicket, getUserTickets, getAllUsers, getAllTickets, updateUserProfileData, getUserData } from '../services/db';
import { translations } from '../data/translations';

import SidebarItem from './dashboard/SidebarItem';
import StatCard from './dashboard/StatCard';
import ServiceCard from './dashboard/ServiceCard';
import SettingsContent from './dashboard/SettingsContent';
import UsersContent from './dashboard/UsersContent';
import SupportContent from './dashboard/SupportContent';

import PackagesContent from './dashboard/PackagesContent';
import ServerContent from './dashboard/ServerContent';

export default function Dashboard() {
    const { t, toggleLanguage } = useLanguage();
    const { currentUser, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect to home if user logs out or session is revoked
    useEffect(() => {
        if (!currentUser) {
            navigate('/', { replace: true });
        }
    }, [currentUser, navigate]);

    // Navigation and Menu State
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const getActiveTab = () => {
        const path = location.pathname.split('/').filter(Boolean).pop();
        return (path === 'dashboard' || !path) ? 'overview' : path;
    };
    const activeTab = getActiveTab();

    // Settings State
    const [settingsTab, setSettingsTab] = useState('profile');
    const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [website, setWebsite] = useState('');
    const [socials, setSocials] = useState({ twitter: '', github: '', linkedin: '' });
    const [coverImage, setCoverImage] = useState('');

    const [notifications, setNotifications] = useState({ email: true, browser: true, marketing: false });
    const [statusMsg, setStatusMsg] = useState(null);
    const [loading, setLoading] = useState(false);

    // Load extra user data from Firestore
    useEffect(() => {
        const loadData = async () => {
            if (currentUser?.uid) {
                try {
                    const data = await getUserData(currentUser.uid);
                    if (data) {
                        if (data.phone) setPhone(data.phone);
                        if (data.bio) setBio(data.bio);
                        if (data.jobTitle) setJobTitle(data.jobTitle);
                        if (data.website) setWebsite(data.website);
                        if (data.socials) setSocials(prev => ({ ...prev, ...data.socials }));
                        if (data.coverImage) setCoverImage(data.coverImage);
                        // Also sync display name if different
                        if (data.displayName && data.displayName !== displayName) setDisplayName(data.displayName);
                    }
                } catch (error) {
                    console.error("Error loading user data:", error);
                }
            }
        };
        loadData();
    }, [currentUser]);

    // Appearance State
    const [accentColor, setAccentColor] = useState('#7c3aed');
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        document.documentElement.style.setProperty('--accent-color', accentColor);
        document.documentElement.style.setProperty('--accent-gradient', `linear-gradient(135deg, ${accentColor} 0%, ${accentColor} 100%)`);
    }, [accentColor]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusMsg(null);

        try {
            // 1. Update Firebase Auth Profile (if changed)
            if (auth.currentUser && displayName !== currentUser.displayName) {
                console.log("Updating Auth Profile...");
                // setStatusMsg({ type: 'info', msg: 'Updating base profile...' }); // Optional UI feedback
                await updateProfile(auth.currentUser, { displayName });
            }

            // 2. Prepare and sanitize data for Firestore
            console.log("Preparing data...");
            const profileData = {
                displayName: displayName || '', // Ensure string
                phone: phone || '',
                bio: bio || '',
                jobTitle: jobTitle || '',
                website: website || '',
                socials: {
                    twitter: socials?.twitter || '',
                    github: socials?.github || '',
                    linkedin: socials?.linkedin || ''
                },
                coverImage: coverImage || ''
            };

            // Remove any undefined keys just in case (though defaults above handle most)
            Object.keys(profileData).forEach(key => profileData[key] === undefined && delete profileData[key]);

            // 3. Update Firestore with Timeout
            console.log("Saving to Firestore...", currentUser.uid, profileData);
            // setStatusMsg({ type: 'info', msg: 'Saving to database...' });

            // Create a timeout promise that rejects after 10 seconds
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Request timed out. Please check your internet connection.")), 10000)
            );

            // Race the update against the timeout
            await Promise.race([
                updateUserProfileData(currentUser.uid, profileData),
                timeoutPromise
            ]);

            console.log("Firestore save complete.");

            setStatusMsg({ type: 'success', msg: t.dashboard.settings.success });
        } catch (err) {
            console.error("Profile Update Error:", err);
            // Show the actual error message to the user for better debugging
            setStatusMsg({ type: 'error', msg: `Error: ${err.message || err.code || 'Unknown error'}` });
        } finally {
            setLoading(false);
            // Clear success message after delay, keep error visible slightly longer or until manual close
            if (statusMsg?.type !== 'error') {
                setTimeout(() => setStatusMsg(null), 3000);
            }
        }
    };

    const handlePasswordReset = async () => {
        if (!currentUser?.email) return;
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, currentUser.email);
            setStatusMsg({ type: 'success', msg: 'Reset link sent to your email!' });
        } catch (err) {
            console.error(err);
            setStatusMsg({ type: 'error', msg: 'Failed to send reset link.' });
        } finally {
            setLoading(false);
            setTimeout(() => setStatusMsg(null), 3000);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (err) {
            console.error(err);
        }
    };

    // Services Data (Mock for UI)
    // Services Data (Mapped from translations)
    const servicesData = [
        { id: 1, name: t.dashboard.servicesList.webHosting.name, status: 'Active', bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', icon: <FiLayers />, desc: t.dashboard.servicesList.webHosting.desc },
        { id: 2, name: t.dashboard.servicesList.domain.name, status: 'Active', bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', icon: <FiHome />, desc: t.dashboard.servicesList.domain.desc },
        { id: 3, name: t.dashboard.servicesList.ssl.name, status: 'Active', bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', icon: <FiShield />, desc: t.dashboard.servicesList.ssl.desc },
        { id: 4, name: t.dashboard.servicesList.email.name, status: 'Available', bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', icon: <FiBox />, desc: t.dashboard.servicesList.email.desc }
    ];

    return (
        <div className="dashboard-layout" style={{
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            display: 'flex',
            padding: '1.5rem',
            gap: '1.5rem',
            position: 'relative'
        }}>
            {/* Floating Sidebar */}
            <aside style={{
                width: 'var(--dash-sidebar-width)',
                background: 'var(--nav-bg)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--dash-radius)',
                padding: '2rem 1.2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                position: 'fixed',
                height: 'calc(100vh - 3rem)',
                zIndex: 100,
                boxShadow: 'var(--glass-shadow)',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }} className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
                <div style={{ marginBottom: '2rem', paddingLeft: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        background: 'var(--accent-gradient)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '800',
                        fontSize: '0.9rem'
                    }}>A</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>Dashboard</div>
                </div>

                {/* User Profile Section in Sidebar */}
                <div style={{
                    margin: '0 0.5rem 2rem 0.5rem',
                    padding: '1.2rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'var(--accent-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.2rem'
                    }}>
                        <FiUser />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{
                            fontSize: '0.9rem',
                            fontWeight: '700',
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {currentUser?.displayName || 'User'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {isAdmin ? t.dashboard.settings.admin : t.dashboard.settings.member}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                    <SidebarItem id="overview" icon={<FiHome />} label={t.dashboard.tabs.overview} activeTab={activeTab} navigate={navigate} setMobileMenuOpen={setMobileMenuOpen} />
                    <SidebarItem id="services" icon={<FiLayers />} label={t.dashboard.tabs.services} activeTab={activeTab} navigate={navigate} setMobileMenuOpen={setMobileMenuOpen} />
                    <SidebarItem id="packages" icon={<FiZap />} label={t.dashboard.tabs.packages} activeTab={activeTab} navigate={navigate} setMobileMenuOpen={setMobileMenuOpen} />
                    <SidebarItem id="server" icon={<FiServer />} label={t.dashboard.tabs.server} activeTab={activeTab} navigate={navigate} setMobileMenuOpen={setMobileMenuOpen} />
                    {isAdmin && (
                        <SidebarItem id="users" icon={<FiUser />} label={t.dashboard.tabs.users} activeTab={activeTab} navigate={navigate} setMobileMenuOpen={setMobileMenuOpen} />
                    )}
                    <SidebarItem id="support" icon={<FiLifeBuoy />} label={t.dashboard.tabs.support} activeTab={activeTab} navigate={navigate} setMobileMenuOpen={setMobileMenuOpen} />
                    <SidebarItem id="settings" icon={<FiSettings />} label={t.dashboard.tabs.settings} activeTab={activeTab} navigate={navigate} setMobileMenuOpen={setMobileMenuOpen} />
                </div>

                <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                    <SidebarItem id="logout" icon={<FiLogOut />} label={t.dashboard.tabs.logout} activeTab={activeTab} navigate={navigate} setMobileMenuOpen={setMobileMenuOpen} handleLogout={handleLogout} danger />
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{
                flexGrow: 1,
                marginLeft: 'calc(var(--dash-sidebar-width) + 1.5rem)',
                transition: 'all 0.3s'
            }} className="main-content">

                {/* Dashboard Top Header (Integrated) */}
                <header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2.5rem',
                    padding: '0.5rem 0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="mobile-only">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                style={{
                                    width: '45px',
                                    height: '45px',
                                    borderRadius: '15px',
                                    background: 'var(--nav-bg)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'var(--text-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem',
                                    boxShadow: 'var(--glass-shadow)'
                                }}
                            >
                                <FiMenu />
                            </button>
                        </div>

                        <div>
                            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                                {activeTab === 'overview' ? t.dashboard.overview.welcome + ' ' + (currentUser?.displayName || 'User') : t.dashboard.tabs[activeTab]}
                            </h1>

                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {/* Language Toggle in Header */}
                        <button
                            onClick={toggleLanguage}
                            style={{
                                padding: '0.6rem 1rem',
                                borderRadius: '12px',
                                background: 'var(--nav-bg)',
                                border: '1px solid var(--glass-border)',
                                color: 'var(--text-primary)',
                                fontWeight: '700',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: 'var(--glass-shadow)',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <FiMonitor style={{ fontSize: '1rem' }} />
                            {translations.tr === t ? 'EN' : 'TR'}
                        </button>

                        <button onClick={toggleTheme} style={{
                            width: '45px',
                            height: '45px',
                            borderRadius: '15px',
                            background: 'var(--nav-bg)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: 'var(--glass-shadow)'
                        }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {theme === 'light' ? <FiMoon /> : <FiSun />}
                        </button>
                    </div>
                </header>

                <div className="dashboard-content-grid">
                    {activeTab === 'overview' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                <StatCard title={t.dashboard.overview.activeServices} value="3" icon={<FiActivity />} color="124, 58, 237" trend="+12%" />
                                <StatCard title={t.dashboard.overview.supportTickets} value="1" icon={<FiMessageSquare />} color="59, 130, 246" trend="0%" />
                                <StatCard title={t.dashboard.overview.accountSecurity} value={t.dashboard.overview.strong} icon={<FiShield />} color="16, 185, 129" trend={t.dashboard.overview.safe} />
                            </div>

                            <section>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>{t.dashboard.overview.currentServices}</h2>
                                    <button style={{
                                        padding: '0.6rem 1.2rem',
                                        borderRadius: '12px',
                                        background: 'var(--accent-gradient)',
                                        color: 'white',
                                        border: 'none',
                                        fontWeight: '600',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <FiPlus /> {t.dashboard.overview.newService}
                                    </button>
                                </div>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                                    gap: '1.5rem'
                                }}>
                                    {servicesData.slice(0, 2).map(service => (
                                        <ServiceCard key={service.id} service={service} t={t} handleConfigure={() => { }} handleServiceActivation={() => { }} />
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'services' && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                            gap: '2rem'
                        }}>
                            {servicesData.map(service => (
                                <ServiceCard key={service.id} service={service} t={t} handleConfigure={() => { }} handleServiceActivation={() => { }} />
                            ))}
                        </div>
                    )}

                    {activeTab === 'packages' && (
                        <PackagesContent t={t} />
                    )}

                    {activeTab === 'server' && (
                        <ServerContent t={t} />
                    )}

                    {activeTab === 'support' && (
                        <div className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--dash-radius)' }}>
                            <SupportContent t={t} currentUser={currentUser} isAdmin={isAdmin} />
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--dash-radius)' }}>
                            <SettingsContent
                                translations={t}
                                settingsTab={settingsTab} setSettingsTab={setSettingsTab}
                                currentUser={currentUser}
                                displayName={displayName} setDisplayName={setDisplayName}
                                phone={phone} setPhone={setPhone}
                                bio={bio} setBio={setBio}
                                jobTitle={jobTitle} setJobTitle={setJobTitle}
                                website={website} setWebsite={setWebsite}
                                socials={socials} setSocials={setSocials}
                                coverImage={coverImage} setCoverImage={setCoverImage}
                                loading={loading} setLoading={setLoading}
                                handleUpdateProfile={handleUpdateProfile}
                                accentColor={accentColor} setAccentColor={setAccentColor}
                                onToggleTheme={toggleTheme} theme={theme}
                                notifications={notifications} setNotifications={setNotifications}
                                handlePasswordReset={handlePasswordReset}
                                statusMsg={statusMsg} setStatusMsg={setStatusMsg}
                            />
                        </div>
                    )}

                    {activeTab === 'users' && isAdmin && (
                        <UsersContent t={t} />
                    )}
                </div>
            </main>

            <style>{`
                @media (max-width: 1024px) {
                    .sidebar {
                        transform: translateX(-110%);
                        left: 1.5rem;
                        box-shadow: 0 20px 50px rgba(0,0,0,0.3);
                    }
                    .sidebar.open {
                        transform: translateX(0);
                    }
                    .main-content {
                        margin-left: 0 !important;
                    }
                }
                
                .dashboard-content-grid {
                    animation: fadeIn 0.5s ease;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
