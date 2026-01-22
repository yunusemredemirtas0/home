import React, { useState, useEffect } from 'react';
import {
    FiUser, FiLock, FiBell, FiMonitor, FiShield, FiGlobe, FiSmartphone,
    FiTrash2, FiDownload, FiCheckCircle, FiLayout, FiLinkedin, FiGithub, FiTwitter,
    FiUpload, FiImage, FiCreditCard, FiLink, FiList, FiCode, FiActivity, FiKey
} from 'react-icons/fi';
import { revokeSessions, getUserDataForExport } from '../../services/db';
import ImageEditorModal from '../common/ImageEditorModal';
import { useLanguage } from '../../contexts/LanguageContext';
import './SettingsContent.css';

const SettingsContent = ({
    translations, settingsTab, setSettingsTab, currentUser, displayName, setDisplayName,
    phone, setPhone, bio, setBio, jobTitle, setJobTitle, website, setWebsite,
    socials, setSocials, coverImage, setCoverImage,
    coverImageFile, setCoverImageFile,
    loading, setLoading, handleUpdateProfile, accentColor,
    setAccentColor, onToggleTheme, theme, notifications, setNotifications,
    handlePasswordReset, statusMsg, setStatusMsg
}) => {
    const { language } = useLanguage();

    // Mock states for new features
    const [twoFactor, setTwoFactor] = useState(false);
    const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [privacy, setPrivacy] = useState({ publicProfile: true, onlineStatus: true });

    // Skills (Mock)
    const [skills, setSkills] = useState(['React', 'Node.js', 'UI/UX']);
    const [newSkill, setNewSkill] = useState('');

    // Advanced Settings Mock Data
    const [apiKeys, setApiKeys] = useState([
        { id: 1, key: 'sk_live_51Mz...', name: 'Production' },
        { id: 2, key: 'sk_test_48Xy...', name: 'Development' }
    ]);
    const [connectedAccounts, setConnectedAccounts] = useState({
        google: true,
        github: true,
        twitter: false
    });
    const [invoices] = useState([
        { id: 'INV-2024-001', date: '2024-01-01', amount: '₺5.000', status: 'paid' },
        { id: 'INV-2023-128', date: '2023-12-01', amount: '₺5.000', status: 'paid' },
        { id: 'INV-2023-115', date: '2023-11-01', amount: '₺2.500', status: 'paid' },
    ]);
    const [auditLogs] = useState([
        { id: 1, action: 'Login Successful', ip: '192.168.1.1', date: 'Just now' },
        { id: 2, action: 'Profile Updated', ip: '192.168.1.1', date: '2 hours ago' },
        { id: 3, action: 'API Key Created', ip: '192.168.1.1', date: 'Yesterday' },
        { id: 4, action: 'Password Changed', ip: '192.168.1.55', date: '3 days ago' },
    ]);

    // Visual Settings
    const [fontSize, setFontSize] = useState('medium'); // small, medium, large
    const [reducedMotion, setReducedMotion] = useState(false);

    // Editor State
    const [editingImage, setEditingImage] = useState(null);

    // Persist UI settings
    useEffect(() => {
        const savedRadius = localStorage.getItem('dash-radius');
        const savedGap = localStorage.getItem('dash-gap');
        const savedFontSize = localStorage.getItem('dash-font-size');
        const savedMotion = localStorage.getItem('dash-reduced-motion');

        if (savedRadius) document.documentElement.style.setProperty('--dash-radius', savedRadius);
        if (savedGap) document.documentElement.style.setProperty('--dash-gap', savedGap);

        if (savedFontSize) {
            setFontSize(savedFontSize);
            document.documentElement.style.fontSize = savedFontSize === 'small' ? '14px' : savedFontSize === 'large' ? '18px' : '16px';
        }

        if (savedMotion === 'true') {
            setReducedMotion(true);
            document.documentElement.classList.add('reduce-motion');
        }
    }, []);

    const updateFontSize = (size) => {
        setFontSize(size);
        localStorage.setItem('dash-font-size', size);
        document.documentElement.style.fontSize = size === 'small' ? '14px' : size === 'large' ? '18px' : '16px';
    };

    const toggleReducedMotion = () => {
        const newVal = !reducedMotion;
        setReducedMotion(newVal);
        localStorage.setItem('dash-reduced-motion', newVal);
        if (newVal) document.documentElement.classList.add('reduce-motion');
        else document.documentElement.classList.remove('reduce-motion');
    };

    const handleAddSkill = (e) => {
        if (e.key === 'Enter' && newSkill.trim()) {
            e.preventDefault();
            if (!skills.includes(newSkill.trim())) {
                setSkills([...skills, newSkill.trim()]);
            }
            setNewSkill('');
        }
    };

    const removeSkill = (skill) => {
        setSkills(skills.filter(s => s !== skill));
    };

    // Cleanup preview URL
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Instead of setting directly, open editor
            const url = URL.createObjectURL(file);
            setEditingImage(url);
            // reset file input value if needed so same file can be selected again
            e.target.value = null;
        }
    };

    const handleCropSave = (croppedBlob) => {
        // Create a new File from the blob
        const newFile = new File([croppedBlob], "cover_cropped.jpg", { type: "image/jpeg" });

        setCoverImageFile(newFile);
        const url = URL.createObjectURL(croppedBlob);
        setPreviewUrl(url);

        // Close editor
        setEditingImage(null);
    };

    const updateRadius = (val) => {
        document.documentElement.style.setProperty('--dash-radius', val);
        localStorage.setItem('dash-radius', val);
    };

    const updateGap = (val) => {
        document.documentElement.style.setProperty('--dash-gap', val);
        localStorage.setItem('dash-gap', val);
    };

    const handleLogoutAllDevices = async () => {
        if (!currentUser) return;
        if (window.confirm("Tüm cihazlardan çıkış yapmak istediğinize emin misiniz? Bu işlem mevcut oturumunuzu da sonlandırabilir.")) {
            setLoading?.(true);
            try {
                await revokeSessions(currentUser.uid);
                setStatusMsg?.({ type: 'success', msg: "Tüm cihazlardan çıkış yapıldı." });
            } catch (error) {
                console.error("Logout error:", error);
                setStatusMsg?.({ type: 'error', msg: "Oturumlar kapatılırken bir hata oluştu." });
            } finally {
                setLoading?.(false);
                setTimeout(() => setStatusMsg?.(null), 3000);
            }
        }
    };

    const handleDownloadData = async () => {
        if (!currentUser) return;
        setLoading?.(true);
        try {
            const data = await getUserDataForExport(currentUser.uid);
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `my-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setStatusMsg?.({ type: 'success', msg: "Verileriniz hazırlandı ve indiriliyor." });
        } catch (error) {
            console.error("Export error:", error);
            setStatusMsg?.({ type: 'error', msg: "Veriler dışa aktarılırken bir hata oluştu." });
        } finally {
            setLoading?.(false);
            setTimeout(() => setStatusMsg?.(null), 3000);
        }
    };

    const categories = [
        { id: 'profile', label: translations.dashboard.settings.profile, icon: FiUser },
        { id: 'appearance', label: translations.dashboard.settings.appearance, icon: FiMonitor },
        { id: 'notifications', label: translations.dashboard.settings.notifications, icon: FiBell },
        { id: 'security', label: translations.dashboard.settings.security, icon: FiShield },
        { id: 'billing', label: translations.dashboard.settings.billing, icon: FiCreditCard },
        { id: 'integrations', label: translations.dashboard.settings.integrations, icon: FiLink },
        { id: 'logs', label: translations.dashboard.settings.logs, icon: FiActivity },
        { id: 'developer', label: translations.dashboard.settings.developer, icon: FiCode }
    ];

    const TabButton = ({ id, label, Icon }) => (
        <button
            onClick={() => setSettingsTab(id)}
            className={`tab-button ${settingsTab === id ? 'active' : ''}`}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    return (
        <div className="settings-container">

            {/* Navigation Tabs (Desktop) */}
            <div className="settings-tabs desktop-only">
                {categories.map(cat => <TabButton key={cat.id} id={cat.id} label={cat.label} Icon={cat.icon} />)}
            </div>

            {/* Navigation Select (Mobile) */}
            <div className="settings-mobile-nav mobile-only">
                <select
                    value={settingsTab}
                    onChange={(e) => setSettingsTab(e.target.value)}
                    className="mobile-nav-select"
                >
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {cat.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Main Content Area */}
            <div className="glass settings-content">

                {/* PROFILE SETTINGS */}
                {settingsTab === 'profile' && (
                    <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="profile-grid">
                            {/* Basic Info */}
                            <div className="form-group">
                                <h4 className="section-header">Temel Bilgiler</h4>
                                <div>
                                    <label className="form-label">{translations.dashboard.settings.email}</label>
                                    <input type="email" value={currentUser?.email || ''} disabled className="form-input" />
                                </div>
                                <div>
                                    <label className="form-label">{translations.dashboard.settings.displayName}</label>
                                    <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="form-input" />
                                </div>
                                <div>
                                    <label className="form-label">{translations.dashboard.settings.jobTitle}</label>
                                    <div className="form-input-wrapper">
                                        <FiUser className="form-input-icon" />
                                        <input
                                            type="text"
                                            value={jobTitle}
                                            onChange={(e) => setJobTitle(e.target.value)}
                                            placeholder="Full Stack Developer"
                                            className="form-input has-icon"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">{translations.dashboard.settings.timezone}</label>
                                    <select
                                        value={timezone}
                                        onChange={(e) => setTimezone(e.target.value)}
                                        className="form-input"
                                    >
                                        <option value="Europe/Istanbul">Europe/Istanbul (GMT+3)</option>
                                        <option value="Europe/London">Europe/London (GMT+0)</option>
                                        <option value="America/New_York">America/New_York (GMT-5)</option>
                                        <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Contact & Social */}
                            <div className="form-group">
                                <h4 className="section-header">İletişim & Sosyal</h4>
                                <div>
                                    <label className="form-label">{translations.dashboard.settings.phone}</label>
                                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+90 5xx xxx xx xx" className="form-input" />
                                </div>
                                <div>
                                    <label className="form-label">{translations.dashboard.settings.website}</label>
                                    <div className="form-input-wrapper">
                                        <FiGlobe className="form-input-icon" />
                                        <input
                                            type="url"
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                            placeholder="https://example.com"
                                            className="form-input has-icon"
                                        />
                                    </div>
                                </div>
                                <div className="social-grid">
                                    <div>
                                        <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>Twitter / X</label>
                                        <input type="text" value={socials.twitter} onChange={(e) => setSocials({ ...socials, twitter: e.target.value })} placeholder="@username" className="form-input" style={{ padding: '0.8rem' }} />
                                    </div>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>GitHub</label>
                                        <input type="text" value={socials.github} onChange={(e) => setSocials({ ...socials, github: e.target.value })} placeholder="username" className="form-input" style={{ padding: '0.8rem' }} />
                                    </div>
                                    <div>
                                        <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>LinkedIn</label>
                                        <input type="text" value={socials.linkedin} onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })} placeholder="username" className="form-input" style={{ padding: '0.8rem' }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">{translations.dashboard.settings.bio}</label>
                            <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} className="form-input form-textarea" />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{translations.dashboard.settings.skills_label}</label>
                            <div className="skills-input-container">
                                {skills.map(skill => (
                                    <span key={skill} className="skill-tag">
                                        {skill}
                                        <span className="skill-tag-remove" onClick={() => removeSkill(skill)}>×</span>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyDown={handleAddSkill}
                                    placeholder="+ Add skill"
                                    style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-primary)', fontSize: '0.9rem', flex: 1, minWidth: '80px' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
                            <label className="form-label" style={{ alignSelf: 'center', marginBottom: '1rem' }}>
                                {language === 'tr' ? 'Profil Fotoğrafı' : 'Profile Photo'}
                            </label>
                            <div style={{
                                width: '150px',
                                height: '150px',
                                borderRadius: '50%',
                                background: 'var(--bg-secondary)',
                                border: '2px dashed var(--border-color)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s',
                                cursor: 'pointer'
                            }}>
                                {(previewUrl || coverImage) && (
                                    <img
                                        src={previewUrl || coverImage}
                                        alt="Profile Preview"
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                        }}
                                    />
                                )}

                                {/* Overlay / Upload Trigger */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: (previewUrl || coverImage) ? 'rgba(0,0,0,0.3)' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: (previewUrl || coverImage) ? 0 : 1,
                                        transition: 'opacity 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = (previewUrl || coverImage) ? 0 : 1}
                                >
                                    <label
                                        style={{
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '100%',
                                            height: '100%',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        <FiImage size={24} style={{ marginBottom: '0.2rem' }} />
                                        <span style={{ fontSize: '0.7rem' }}>{translations.dashboard.tabs.server === 'Sunucu İzleme' ? 'Değiştir' : 'Change'}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" disabled={loading} className="btn-primary-action">
                                <FiCheckCircle /> {loading ? '...' : translations.dashboard.settings.updateProfile}
                            </button>
                        </div>
                    </form>
                )}

                {/* APPEARANCE SETTINGS */}
                {settingsTab === 'appearance' && (
                    <div className="appearance-grid">

                        {/* Theme & Accent */}
                        <div className="settings-card">
                            <h3><FiMonitor /> {translations.dashboard.settings.theme}</h3>
                            <div className="theme-toggle-group">
                                <button
                                    onClick={() => theme === 'dark' && onToggleTheme()}
                                    className={`theme-btn ${theme === 'light' ? 'active-light' : ''}`}
                                >
                                    {translations.dashboard.settings.lightMode}
                                </button>
                                <button
                                    onClick={() => theme === 'light' && onToggleTheme()}
                                    className={`theme-btn ${theme === 'dark' ? 'active-dark' : ''}`}
                                >
                                    {translations.dashboard.settings.darkMode}
                                </button>
                            </div>

                            <h3>
                                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: accentColor }}></div> {translations.dashboard.settings.accentColor}
                            </h3>
                            <div className="accent-color-grid">
                                {['#7c3aed', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6', '#f97316', '#8b5cf6'].map(col => (
                                    <button
                                        key={col}
                                        onClick={() => setAccentColor(col)}
                                        className={`accent-btn ${accentColor === col ? 'active' : ''}`}
                                        style={{ background: col }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Interface Customization */}
                        <div className="settings-card">
                            <h3><FiLayout /> {translations.dashboard.settings.interfaceStyle}</h3>

                            {/* Border Radius */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="form-label" style={{ marginBottom: '0.8rem' }}>
                                    {translations.dashboard.settings.borderRadius}
                                </label>
                                <div className="radius-group">
                                    {[
                                        { val: '4px', label: translations.dashboard.settings.sharp },
                                        { val: '20px', label: translations.dashboard.settings.rounded },
                                        { val: '32px', label: translations.dashboard.settings.pill }
                                    ].map(opt => (
                                        <button
                                            key={opt.val}
                                            onClick={() => updateRadius(opt.val)}
                                            className="radius-btn"
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Font Size */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="form-label" style={{ marginBottom: '0.8rem' }}>
                                    {translations.dashboard.settings.fontSize}
                                </label>
                                <div className="radius-group">
                                    {[
                                        { val: 'small', label: translations.dashboard.settings.small },
                                        { val: 'medium', label: translations.dashboard.settings.medium },
                                        { val: 'large', label: translations.dashboard.settings.large }
                                    ].map(opt => (
                                        <button
                                            key={opt.val}
                                            onClick={() => updateFontSize(opt.val)}
                                            className="radius-btn"
                                            style={{ fontWeight: fontSize === opt.val ? 'bold' : 'normal', background: fontSize === opt.val ? 'var(--bg-primary)' : 'transparent' }}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Density & Motion */}
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '120px' }}>
                                    <label className="form-label" style={{ marginBottom: '0.5rem' }}>{translations.dashboard.settings.density}</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => updateGap('1rem')} className="radius-btn" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>{translations.dashboard.settings.compact}</button>
                                        <button onClick={() => updateGap('2rem')} className="radius-btn" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>{translations.dashboard.settings.comfortable}</button>
                                    </div>
                                </div>
                                <div style={{ flex: 1, minWidth: '120px' }}>
                                    <label className="form-label" style={{ marginBottom: '0.5rem' }}>{translations.dashboard.settings.reducedMotion}</label>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={reducedMotion}
                                            onChange={toggleReducedMotion}
                                        />
                                        <span className="slider round"></span>
                                    </label>
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
                            <div key={item.id} className="notification-item" style={{ alignItems: 'flex-start' }}>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '200px' }}>
                                    <div className="notification-icon-wrapper"><item.icon size={20} /></div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: '600', fontSize: '1rem' }}>{item.label}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Receive updates via {item.label.toLowerCase()}.</span>
                                    </div>
                                </div>

                                {/* Granular Channels */}
                                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.8rem' }}>{translations.dashboard.settings.push}</span>
                                        <label className="switch" style={{ transform: 'scale(0.8)' }}>
                                            <input
                                                type="checkbox"
                                                checked={notifications?.[item.id] || false}
                                                onChange={(e) => setNotifications({ ...notifications, [item.id]: e.target.checked })}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.8rem' }}>{translations.dashboard.settings.email}</span>
                                        <label className="switch" style={{ transform: 'scale(0.8)' }}>
                                            <input type="checkbox" checked={true} disabled />
                                            <span className="slider round" style={{ opacity: 0.5 }}></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* SECURITY & DATA SETTINGS */}
                {settingsTab === 'security' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Privacy Settings */}
                        <div className="settings-card">
                            <h3><FiShield /> {translations.dashboard.settings.privacy}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{translations.dashboard.settings.publicProfile}</span>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={privacy.publicProfile}
                                            onChange={(e) => setPrivacy({ ...privacy, publicProfile: e.target.checked })}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{translations.dashboard.settings.onlineStatus}</span>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={privacy.onlineStatus}
                                            onChange={(e) => setPrivacy({ ...privacy, onlineStatus: e.target.checked })}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Login Activity */}
                        <div className="settings-card">
                            <h3 style={{ marginBottom: '1rem' }}><FiMonitor /> {translations.dashboard.settings.loginActivity}</h3>
                            <div className="activity-list">
                                <div className="activity-item">
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div className="activity-icon"><FiMonitor /></div>
                                        <div className="activity-info">
                                            <h4>Windows 10 - Chrome</h4>
                                            <p>Istanbul, TR • 192.168.1.1</p>
                                        </div>
                                    </div>
                                    <span className="tag-active">Active Now</span>
                                </div>
                                <div className="activity-item">
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div className="activity-icon"><FiSmartphone /></div>
                                        <div className="activity-info">
                                            <h4>iPhone 13 - Safari</h4>
                                            <p>Istanbul, TR • 2 hours ago</p>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Signed out</span>
                                </div>
                            </div>
                        </div>

                        {/* 2FA Section */}
                        <div className="settings-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h3 style={{ marginBottom: '0.5rem' }}><FiLock /> {translations.dashboard.settings.twoFactor}</h3>
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
                        <div className="settings-card">
                            <h3 style={{ marginBottom: '1rem' }}>{translations.dashboard.settings.changePassword}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{translations.dashboard.settings.passwordResetTo} <strong>{currentUser?.email}</strong></p>
                            <button onClick={handlePasswordReset} disabled={loading} className="btn-secondary">
                                {translations.dashboard.settings.sendResetLink}
                            </button>
                        </div>

                        {/* Session Management */}
                        <div className="settings-card">
                            <h3 style={{ marginBottom: '1rem' }}>{translations.dashboard.settings.sessions}</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <FiMonitor size={24} style={{ color: 'var(--text-secondary)' }} />
                                    <div>
                                        <div style={{ fontWeight: '600' }}>Current Session</div>
                                        <div style={{ fontSize: '0.8rem', color: '#10b981' }}>Active</div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogoutAllDevices}
                                    style={{ color: 'var(--text-secondary)', textDecoration: 'underline', fontSize: '0.9rem', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    {translations.dashboard.settings.logoutAll}
                                </button>
                            </div>
                        </div>

                        {/* Data Export */}
                        <div className="settings-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h3 style={{ marginBottom: '0.5rem' }}>{translations.dashboard.settings.dataExport}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{translations.dashboard.settings.dataExportDesc}</p>
                            </div>
                            <button onClick={handleDownloadData} className="btn-secondary">
                                <FiDownload /> Download
                            </button>
                        </div>

                        {/* Danger Zone */}
                        <div className="danger-zone">
                            <h3 style={{ fontSize: '1.1rem', color: '#ef4444', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiTrash2 /> {translations.dashboard.settings.dangerZone}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{translations.dashboard.settings.deleteAccountWarning}</p>
                            <button className="btn-danger">
                                {translations.dashboard.settings.deleteAccount}
                            </button>
                        </div>

                    </div>
                )}

                {/* BILLING SETTINGS */}
                {settingsTab === 'billing' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Current Plan */}
                        <div className="settings-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(124, 58, 237, 0.05) 100%)' }}>
                            <div>
                                <h3 style={{ marginBottom: '0.5rem' }}>{translations.dashboard.settings.plan}</h3>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>Professional Plan</div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Billed monthly • Next payment on Feb 1, 2026</p>
                            </div>
                            <button className="btn-primary-action" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
                                {translations.dashboard.settings.upgrade}
                            </button>
                        </div>

                        {/* Usage Statistics */}
                        <div className="settings-card">
                            <h3 style={{ marginBottom: '1.5rem' }}><FiActivity /> {translations.dashboard.settings.usage}</h3>
                            <div className="usage-card">
                                <div className="usage-header">
                                    <span>{translations.dashboard.settings.storage} (25GB / 50GB)</span>
                                    <span>50%</span>
                                </div>
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill" style={{ width: '50%' }}></div>
                                </div>
                            </div>
                            <div className="usage-card">
                                <div className="usage-header">
                                    <span>{translations.dashboard.settings.apiCalls} (8,432 / 10,000)</span>
                                    <span>84%</span>
                                </div>
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill" style={{ width: '84%', background: '#f59e0b' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Invoice History */}
                        <div className="settings-card">
                            <h3 style={{ marginBottom: '1rem' }}><FiList /> {translations.dashboard.settings.paymentHistory}</h3>
                            <table className="invoice-table">
                                <thead>
                                    <tr>
                                        <th>{translations.dashboard.settings.invoice}</th>
                                        <th>{translations.dashboard.settings.date}</th>
                                        <th>{translations.dashboard.settings.amount}</th>
                                        <th>{translations.dashboard.settings.status}</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map(inv => (
                                        <tr key={inv.id}>
                                            <td style={{ fontWeight: '600' }}>#{inv.id}</td>
                                            <td>{inv.date}</td>
                                            <td>{inv.amount}</td>
                                            <td>
                                                <span className={`status-chip ${inv.status === 'paid' ? 'status-paid' : 'status-pending'}`}>
                                                    {inv.status === 'paid' ? translations.dashboard.settings.paid : translations.dashboard.settings.pending}
                                                </span>
                                            </td>
                                            <td><FiDownload style={{ cursor: 'pointer', color: 'var(--text-secondary)' }} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* INTEGRATIONS SETTINGS */}
                {settingsTab === 'integrations' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h3 className="section-header">{translations.dashboard.settings.connectedAccounts}</h3>

                        <div className="integration-item">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ fontSize: '1.5rem' }}><FiGithub /></div>
                                <div>
                                    <div style={{ fontWeight: '600' }}>GitHub</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Code repository and auth</div>
                                </div>
                            </div>
                            <button
                                className={`btn-secondary ${connectedAccounts.github ? '' : 'btn-primary-action'}`}
                                style={{ width: '120px', justifyContent: 'center' }}
                            >
                                {connectedAccounts.github ? translations.dashboard.settings.disconnect : translations.dashboard.settings.connect}
                            </button>
                        </div>

                        <div className="integration-item">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ fontSize: '1.5rem' }}><FiGlobe /></div>
                                <div>
                                    <div style={{ fontWeight: '600' }}>Google</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Calendar and Mail access</div>
                                </div>
                            </div>
                            <button
                                className={`btn-secondary ${connectedAccounts.google ? '' : 'btn-primary-action'}`}
                                style={{ width: '120px', justifyContent: 'center' }}
                            >
                                {connectedAccounts.google ? translations.dashboard.settings.disconnect : translations.dashboard.settings.connect}
                            </button>
                        </div>

                        <div className="integration-item">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ fontSize: '1.5rem' }}><FiTwitter /></div>
                                <div>
                                    <div style={{ fontWeight: '600' }}>Twitter / X</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Social sharing</div>
                                </div>
                            </div>
                            <button
                                className={`btn-secondary ${connectedAccounts.twitter ? '' : 'btn-primary-action'}`}
                                style={{ width: '120px', justifyContent: 'center' }}
                            >
                                {connectedAccounts.twitter ? translations.dashboard.settings.disconnect : translations.dashboard.settings.connect}
                            </button>
                        </div>
                    </div>
                )}

                {/* AUDIT LOGS */}
                {settingsTab === 'logs' && (
                    <div className="settings-card">
                        <h3 style={{ marginBottom: '2rem' }}><FiActivity /> {translations.dashboard.settings.auditLog}</h3>
                        <div className="log-timeline">
                            {auditLogs.map(log => (
                                <div key={log.id} className="log-item">
                                    <div className="log-header">
                                        <span style={{ fontWeight: '600' }}>{log.action}</span>
                                        <span className="log-timestamp">{log.date}</span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {translations.dashboard.settings.ipBefore}: {log.ip}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* DEVELOPER SETTINGS */}
                {settingsTab === 'developer' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div className="settings-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3><FiKey /> {translations.dashboard.settings.apiKeys}</h3>
                                <button className="btn-primary-action" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                                    <span style={{ fontSize: '1.2rem', marginRight: '0.3rem' }}>+</span> {translations.dashboard.settings.generateKey}
                                </button>
                            </div>

                            {apiKeys.map(key => (
                                <div key={key.id} style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                                        <span style={{ fontWeight: '600' }}>{key.name}</span>
                                        <span style={{ color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>{translations.dashboard.settings.revoke}</span>
                                    </div>
                                    <div className="api-key-box">
                                        <input type="text" value={key.key} readOnly className="api-input" />
                                        <button className="btn-secondary" style={{ padding: '0.5rem 1rem' }} title={translations.dashboard.settings.copy}>
                                            <FiCheckCircle size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="settings-card">
                            <h3><FiLink /> Webhooks</h3>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                Receive real-time events to your external server.
                            </p>
                            <label className="form-label">{translations.dashboard.settings.webhookUrl}</label>
                            <input
                                type="url"
                                placeholder="https://api.yoursite.com/webhooks"
                                className="form-input"
                            />
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                                <button className="btn-secondary">Test Ping</button>
                                <button className="btn-primary-action">Save URL</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Editor Modal Overlay */}
            {
                editingImage && (
                    <ImageEditorModal
                        imageSrc={editingImage}
                        onCancel={() => setEditingImage(null)}
                        onSave={handleCropSave}
                        aspect={1} // Profile photo square aspect
                        cropShape="round" // Circular stencil
                    />
                )
            }

            {
                statusMsg?.msg && (
                    <div className={`status-msg ${statusMsg.type === 'success' ? 'status-success' : 'status-error'}`}>
                        {statusMsg.msg}
                    </div>
                )
            }
        </div >
    );
};

export default SettingsContent;
