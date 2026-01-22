import React, { useState, useEffect } from 'react';
import {
    FiUser, FiLock, FiBell, FiMonitor, FiShield, FiGlobe, FiSmartphone,
    FiTrash2, FiDownload, FiCheckCircle, FiLayout, FiLinkedin, FiGithub, FiTwitter,
    FiUpload, FiImage
} from 'react-icons/fi';
import { revokeSessions, getUserDataForExport } from '../../services/db';
import ImageEditorModal from '../common/ImageEditorModal';
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

    // Mock states for new features (visual only for now)
    const [twoFactor, setTwoFactor] = useState(false);
    const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Editor State
    const [editingImage, setEditingImage] = useState(null);

    // Persist UI settings
    useEffect(() => {
        const savedRadius = localStorage.getItem('dash-radius');
        const savedGap = localStorage.getItem('dash-gap');
        if (savedRadius) document.documentElement.style.setProperty('--dash-radius', savedRadius);
        if (savedGap) document.documentElement.style.setProperty('--dash-gap', savedGap);
    }, []);

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
        { id: 'security', label: translations.dashboard.settings.security, icon: FiShield }
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

                        <div>
                            <label className="form-label">{translations.dashboard.settings.bio}</label>
                            <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} className="form-input form-textarea" />
                        </div>

                        <div>
                            <label className="form-label">{translations.dashboard.settings.coverImage}</label>
                            <div style={{
                                width: '100%',
                                minHeight: '180px',
                                borderRadius: '16px',
                                background: 'var(--bg-secondary)',
                                border: '2px dashed var(--border-color)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1rem',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s'
                            }}>
                                {(previewUrl || coverImage) && (
                                    <img
                                        src={previewUrl || coverImage}
                                        alt="Cover Preview"
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            opacity: 0.4
                                        }}
                                    />
                                )}
                                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '1.5rem' }}>
                                    <FiImage size={32} style={{ color: 'var(--accent-color)', marginBottom: '0.5rem' }} />
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.2rem', fontWeight: '500' }}>
                                        {coverImageFile ? coverImageFile.name : (translations.dashboard.tabs.server === 'Sunucu İzleme' ? 'Kapak fotoğrafınızı yüklemek için tıklayın' : 'Click to upload your cover image')}
                                    </p>
                                    <label
                                        className="btn-secondary"
                                        style={{ cursor: 'pointer', display: 'inline-flex', alignSelf: 'center', padding: '0.7rem 1.2rem' }}
                                    >
                                        <FiUpload /> {translations.dashboard.tabs.server === 'Sunucu İzleme' ? 'Dosya Seç' : 'Choose File'}
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
                                {['#7c3aed', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'].map(col => (
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
                            <div style={{ marginBottom: '2rem' }}>
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

                            <div style={{ marginBottom: '1rem' }}>
                                <label className="form-label" style={{ marginBottom: '0.8rem' }}>
                                    {translations.dashboard.settings.density}
                                </label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button onClick={() => updateGap('1rem')} className="radius-btn" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>{translations.dashboard.settings.compact}</button>
                                    <button onClick={() => updateGap('2rem')} className="radius-btn" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>{translations.dashboard.settings.comfortable}</button>
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
                            <div key={item.id} className="notification-item">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div className="notification-icon-wrapper"><item.icon size={20} /></div>
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
                                        <div style={{ fontWeight: '600' }}>Windows 10 - Chrome</div>
                                        <div style={{ fontSize: '0.8rem', color: '#10b981' }}>Active Now • Istanbul, TR</div>
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
            </div>

            {/* Editor Modal Overlay */}
            {editingImage && (
                <ImageEditorModal
                    imageSrc={editingImage}
                    onCancel={() => setEditingImage(null)}
                    onSave={handleCropSave}
                    aspect={16 / 9} // Cover image aspect ratio
                />
            )}

            {statusMsg?.msg && (
                <div className={`status-msg ${statusMsg.type === 'success' ? 'status-success' : 'status-error'}`}>
                    {statusMsg.msg}
                </div>
            )}
        </div>
    );
};

export default SettingsContent;
