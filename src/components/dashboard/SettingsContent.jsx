import React, { useState, useEffect } from 'react';
import {
    FiUser, FiLock, FiBell, FiMonitor, FiShield, FiGlobe, FiSmartphone,
    FiTrash2, FiDownload, FiLogOut, FiCheckCircle, FiLayout, FiLinkedin, FiGithub, FiTwitter
} from 'react-icons/fi';

const SettingsContent = ({
    translations, settingsTab, setSettingsTab, currentUser, displayName, setDisplayName,
    phone, setPhone, bio, setBio, jobTitle, setJobTitle, website, setWebsite,
    socials, setSocials, coverImage, setCoverImage,
    loading, handleUpdateProfile, accentColor,
    setAccentColor, onToggleTheme, theme, notifications, setNotifications,
    handlePasswordReset, statusMsg
}) => {

    // Mock states for new features (visual only for now)
    const [twoFactor, setTwoFactor] = useState(false);
    const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

    // Persist UI settings
    useEffect(() => {
        const savedRadius = localStorage.getItem('dash-radius');
        const savedGap = localStorage.getItem('dash-gap');
        if (savedRadius) document.documentElement.style.setProperty('--dash-radius', savedRadius);
        if (savedGap) document.documentElement.style.setProperty('--dash-gap', savedGap);
    }, []);

    const updateRadius = (val) => {
        document.documentElement.style.setProperty('--dash-radius', val);
        localStorage.setItem('dash-radius', val);
    };

    const updateGap = (val) => {
        document.documentElement.style.setProperty('--dash-gap', val);
        localStorage.setItem('dash-gap', val);
    };

    const categories = [
        { id: 'profile', label: translations.dashboard.settings.profile, icon: FiUser },
        { id: 'appearance', label: translations.dashboard.settings.appearance, icon: FiMonitor },
        { id: 'notifications', label: translations.dashboard.settings.notifications, icon: FiBell },
        { id: 'security', label: translations.dashboard.settings.security, icon: FiShield }
    ];

    const TabButton = ({ id, label, Icon }) => (
        <button
            onClick={() => setSettingsTab(id)}
            style={{
                padding: '0.8rem 1.2rem',
                borderRadius: '12px',
                background: settingsTab === id ? 'var(--accent-gradient)' : 'transparent',
                border: 'none',
                color: settingsTab === id ? 'white' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                fontWeight: settingsTab === id ? '600' : '500',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: settingsTab === id ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none'
            }}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Navigation Tabs */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                overflowX: 'auto',
                padding: '0.5rem',
                background: 'var(--bg-secondary)',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                scrollbarWidth: 'none'
            }}>
                {categories.map(cat => <TabButton key={cat.id} id={cat.id} label={cat.label} Icon={cat.icon} />)}
            </div>

            {/* Main Content Area */}
            <div className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--dash-radius)', minHeight: '500px' }}>

                {/* PROFILE SETTINGS */}
                {settingsTab === 'profile' && (
                    <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                            {/* Basic Info */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Temel Bilgiler</h4>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>{translations.dashboard.settings.email}</label>
                                    <input type="email" value={currentUser?.email || ''} disabled style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'not-allowed' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>{translations.dashboard.settings.displayName}</label>
                                    <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>{translations.dashboard.settings.jobTitle}</label>
                                    <div style={{ position: 'relative' }}>
                                        <FiUser style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                        <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Full Stack Developer" style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>{translations.dashboard.settings.timezone}</label>
                                    <select
                                        value={timezone}
                                        onChange={(e) => setTimezone(e.target.value)}
                                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                                    >
                                        <option value="Europe/Istanbul">Europe/Istanbul (GMT+3)</option>
                                        <option value="Europe/London">Europe/London (GMT+0)</option>
                                        <option value="America/New_York">America/New_York (GMT-5)</option>
                                        <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Contact & Social */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>İletişim & Sosyal</h4>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>{translations.dashboard.settings.phone}</label>
                                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+90 5xx xxx xx xx" style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>{translations.dashboard.settings.website}</label>
                                    <div style={{ position: 'relative' }}>
                                        <FiGlobe style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                        <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Twitter / X</label>
                                        <input type="text" value={socials.twitter} onChange={(e) => setSocials({ ...socials, twitter: e.target.value })} placeholder="@username" style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>GitHub</label>
                                        <input type="text" value={socials.github} onChange={(e) => setSocials({ ...socials, github: e.target.value })} placeholder="username" style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>LinkedIn</label>
                                        <input type="text" value={socials.linkedin} onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })} placeholder="username" style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>{translations.dashboard.settings.bio}</label>
                            <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', resize: 'none', fontFamily: 'inherit' }} />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>{translations.dashboard.settings.coverImage}</label>
                            <input type="text" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" disabled={loading} style={{
                                padding: '1rem 2rem',
                                borderRadius: '12px',
                                background: 'var(--accent-gradient)',
                                color: 'white',
                                border: 'none',
                                fontWeight: '700',
                                cursor: loading ? 'wait' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)'
                            }}>
                                <FiCheckCircle /> {loading ? '...' : translations.dashboard.settings.updateProfile}
                            </button>
                        </div>
                    </form>
                )}

                {/* APPEARANCE SETTINGS */}
                {settingsTab === 'appearance' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                        {/* Theme & Accent */}
                        <div style={{ padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FiMonitor /> {translations.dashboard.settings.theme}
                            </h3>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => theme === 'dark' && onToggleTheme()}
                                    style={{
                                        flex: 1, padding: '1rem', borderRadius: '12px',
                                        border: theme === 'light' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                                        background: theme === 'light' ? 'white' : 'transparent',
                                        color: 'black', fontWeight: theme === 'light' ? '700' : '400',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {translations.dashboard.settings.lightMode}
                                </button>
                                <button
                                    onClick={() => theme === 'light' && onToggleTheme()}
                                    style={{
                                        flex: 1, padding: '1rem', borderRadius: '12px',
                                        border: theme === 'dark' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                                        background: theme === 'dark' ? '#1f2937' : 'transparent',
                                        color: 'white', fontWeight: theme === 'dark' ? '700' : '400',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {translations.dashboard.settings.darkMode}
                                </button>
                            </div>

                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: accentColor }}></div> {translations.dashboard.settings.accentColor}
                            </h3>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {['#7c3aed', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'].map(col => (
                                    <button
                                        key={col}
                                        onClick={() => setAccentColor(col)}
                                        style={{
                                            width: '40px', height: '40px', borderRadius: '10px', background: col,
                                            border: accentColor === col ? '3px solid white' : 'none',
                                            cursor: 'pointer', boxShadow: accentColor === col ? '0 0 0 2px var(--text-primary)' : 'none',
                                            transform: accentColor === col ? 'scale(1.1)' : 'scale(1)',
                                            transition: 'all 0.2s'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Interface Customization */}
                        <div style={{ padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FiLayout /> {translations.dashboard.settings.interfaceStyle}
                            </h3>

                            {/* Border Radius */}
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>
                                    {translations.dashboard.settings.borderRadius}
                                </label>
                                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', borderRadius: '12px', padding: '0.3rem' }}>
                                    {[
                                        { val: '4px', label: translations.dashboard.settings.sharp },
                                        { val: '20px', label: translations.dashboard.settings.rounded },
                                        { val: '32px', label: translations.dashboard.settings.pill }
                                    ].map(opt => (
                                        <button
                                            key={opt.val}
                                            onClick={() => updateRadius(opt.val)}
                                            style={{
                                                flex: 1, padding: '0.6rem', borderRadius: '10px',
                                                border: 'none', background: 'transparent',
                                                color: 'var(--text-primary)', fontSize: '0.9rem',
                                                cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                            onFocus={(e) => e.target.style.background = 'var(--bg-primary)'}
                                            onBlur={(e) => e.target.style.background = 'transparent'}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>
                                    {translations.dashboard.settings.density}
                                </label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button onClick={() => updateGap('1rem')} style={{ padding: '0.8rem 1.5rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', flex: 1, cursor: 'pointer' }}>{translations.dashboard.settings.compact}</button>
                                    <button onClick={() => updateGap('2rem')} style={{ padding: '0.8rem 1.5rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', flex: 1, cursor: 'pointer' }}>{translations.dashboard.settings.comfortable}</button>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* NOTIFICATION SETTINGS */}
                {settingsTab === 'notifications' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {[
                            { id: 'email', label: translations.dashboard.settings.emailNotifications, icon: FiUser },
                            { id: 'browser', label: translations.dashboard.settings.browserNotifications, icon: FiMonitor },
                            { id: 'sms', label: translations.dashboard.settings.smsNotifications, icon: FiSmartphone },
                            { id: 'marketing', label: translations.dashboard.settings.marketingEmails, icon: FiGlobe }
                        ].map(item => (
                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ padding: '0.8rem', background: 'rgba(124, 58, 237, 0.1)', borderRadius: '10px', color: 'var(--accent-color)' }}><item.icon size={20} /></div>
                                    <span style={{ fontWeight: '600', fontSize: '1rem' }}>{item.label}</span>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={notifications?.[item.id] || false}
                                        onChange={(e) => setNotifications({ ...notifications, [item.id]: e.target.checked })}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        ))}
                    </div>
                )}

                {/* SECURITY & DATA SETTINGS */}
                {settingsTab === 'security' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* 2FA Section */}
                        <div style={{ padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiLock /> {translations.dashboard.settings.twoFactor}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{translations.dashboard.settings.twoFactorDesc}</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={twoFactor}
                                    onChange={(e) => setTwoFactor(e.target.checked)}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        {/* Password Reset */}
                        <div style={{ padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{translations.dashboard.settings.changePassword}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{translations.dashboard.settings.passwordResetTo} <strong>{currentUser?.email}</strong></p>
                            <button onClick={handlePasswordReset} disabled={loading} style={{ padding: '0.8rem 1.5rem', borderRadius: '10px', background: 'transparent', border: '1px solid var(--text-primary)', color: 'var(--text-primary)', fontWeight: '600', cursor: 'pointer' }}>
                                {translations.dashboard.settings.sendResetLink}
                            </button>
                        </div>

                        {/* Session Management */}
                        <div style={{ padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{translations.dashboard.settings.sessions}</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <FiMonitor size={24} style={{ color: 'var(--text-secondary)' }} />
                                    <div>
                                        <div style={{ fontWeight: '600' }}>Windows 10 - Chrome</div>
                                        <div style={{ fontSize: '0.8rem', color: '#10b981' }}>Active Now • Istanbul, TR</div>
                                    </div>
                                </div>
                                <button style={{ color: 'var(--text-secondary)', textDecoration: 'underline', fontSize: '0.9rem' }}>{translations.dashboard.settings.logoutAll}</button>
                            </div>
                        </div>

                        {/* Data Export */}
                        <div style={{ padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{translations.dashboard.settings.dataExport}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{translations.dashboard.settings.dataExportDesc}</p>
                            </div>
                            <button style={{ padding: '0.8rem 1.5rem', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <FiDownload /> Download
                            </button>
                        </div>

                        {/* Danger Zone */}
                        <div style={{ padding: '2rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <h3 style={{ fontSize: '1.1rem', color: '#ef4444', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiTrash2 /> {translations.dashboard.settings.dangerZone}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{translations.dashboard.settings.deleteAccountWarning}</p>
                            <button style={{ padding: '0.8rem 1.5rem', borderRadius: '10px', background: '#ef4444', border: 'none', color: 'white', fontWeight: '600', cursor: 'pointer' }}>
                                {translations.dashboard.settings.deleteAccount}
                            </button>
                        </div>

                    </div>
                )}
            </div>

            {statusMsg?.msg && (
                <div style={{ padding: '1rem', borderRadius: '12px', background: statusMsg.type === 'success' ? '#d1fae5' : '#fee2e2', color: statusMsg.type === 'success' ? '#065f46' : '#991b1b', textAlign: 'center', fontWeight: '600' }}>
                    {statusMsg.msg}
                </div>
            )}
        </div>
    );
};

export default SettingsContent;
