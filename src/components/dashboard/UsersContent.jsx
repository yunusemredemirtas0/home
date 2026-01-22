import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
    getAllUsers,
    deleteUserAdmin,
    updateUserDataAdmin,
    registerUserManual,
    registerUserFull
} from '../../services/db';
import {
    FiUser, FiMail, FiClock, FiShield, FiPlus, FiEdit2, FiTrash2, FiX,
    FiCheck, FiInfo, FiGlobe, FiLinkedin, FiGithub, FiTwitter, FiMessageSquare, FiImage
} from 'react-icons/fi';

const UsersContent = () => {
    const { t, language } = useLanguage();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('edit'); // 'edit', 'add'
    const [selectedUser, setSelectedUser] = useState(null);
    const [statusMsg, setStatusMsg] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: '',
        role: 'user',
        phone: '',
        jobTitle: '',
        bio: '',
        website: '',
        socials: {
            twitter: '',
            github: '',
            linkedin: ''
        },
        coverImage: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    const refreshUsers = async () => {
        setLoading(true);
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUsers();
    }, []);

    const handleOpenAddModal = () => {
        setModalType('add');
        setFormData({
            displayName: '',
            email: '',
            password: '',
            role: 'user',
            phone: '',
            jobTitle: '',
            bio: '',
            website: '',
            socials: {
                twitter: '',
                github: '',
                linkedin: ''
            },
            coverImage: '',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
        setShowModal(true);
    };

    const handleOpenEditModal = (user) => {
        setModalType('edit');
        setSelectedUser(user);
        setFormData({
            displayName: user.displayName || '',
            email: user.email || '',
            password: '',
            role: user.role || 'user',
            phone: user.phone || '',
            jobTitle: user.jobTitle || '',
            bio: user.bio || '',
            website: user.website || '',
            socials: {
                twitter: user.socials?.twitter || '',
                github: user.socials?.github || '',
                linkedin: user.socials?.linkedin || ''
            },
            coverImage: user.coverImage || '',
            timezone: user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
        });
        setShowModal(true);
    };

    const handleDeleteUser = async (user) => {
        if (window.confirm(`${user.displayName || user.email} kullanıcısını silmek istediğinize emin misiniz?`)) {
            setActionLoading(true);
            try {
                await deleteUserAdmin(user.id);
                setStatusMsg({ type: 'success', msg: 'Kullanıcı silindi.' });
                refreshUsers();
            } catch (err) {
                console.error(err);
                setStatusMsg({ type: 'error', msg: 'Kullanıcı silinemedi.' });
            } finally {
                setActionLoading(false);
                setTimeout(() => setStatusMsg(null), 3000);
            }
        }
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setStatusMsg(null);
        try {
            if (modalType === 'edit') {
                await updateUserDataAdmin(selectedUser.id, formData);
                setStatusMsg({ type: 'success', msg: 'Kullanıcı güncellendi.' });
            } else {
                if (!formData.password) {
                    throw new Error(language === 'tr' ? 'Şifre gereklidir.' : 'Password is required.');
                }
                await registerUserFull(formData, formData.password);
                setStatusMsg({ type: 'success', msg: 'Kullanıcı kaydı ve hesabı oluşturuldu.' });
            }
            setShowModal(false);
            refreshUsers();
        } catch (err) {
            console.error(err);
            setStatusMsg({ type: 'error', msg: err.message || 'İşlem başarısız.' });
        } finally {
            setActionLoading(false);
            setTimeout(() => setStatusMsg(null), 3000);
        }
    };

    if (loading && users.length === 0) return <div style={{ color: 'var(--text-secondary)' }}>{t.dashboard.admin.users.loading}</div>;

    const formatDate = (timestamp) => {
        if (!timestamp) return t.dashboard.admin.users.neverLogin;
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        {t.dashboard.admin.users.title}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                        {t.dashboard.admin.users.subtitle}
                    </p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="btn-primary-action"
                    style={{ padding: '0.8rem 1.5rem' }}
                >
                    <FiPlus /> {language === 'tr' ? 'Kullanıcı Ekle' : 'Add User'}
                </button>
            </div>

            {/* Status Message Overlay */}
            {statusMsg && (
                <div className={`status-msg ${statusMsg.type === 'success' ? 'status-success' : 'status-error'}`} style={{ position: 'fixed', top: '2rem', right: '2rem', zIndex: 1000 }}>
                    {statusMsg.msg}
                </div>
            )}

            {/* Mobile Responsive Users Table Styles */}
            <style>
                {`
                    @media (max-width: 1024px) {
                        .users-table thead { display: none; }
                        .users-table tbody tr {
                            display: flex;
                            flex-direction: column;
                            background: var(--bg-secondary);
                            margin-bottom: 1.5rem;
                            border-radius: 20px;
                            padding: 1.5rem;
                            border: 1px solid var(--border-color);
                            position: relative;
                        }
                        .users-table td {
                            padding: 0.8rem 0 !important;
                            border-bottom: none !important;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                        }
                        .users-table td::before {
                            content: attr(data-label);
                            font-weight: 700;
                            color: var(--text-secondary);
                            font-size: 0.8rem;
                            text-transform: uppercase;
                        }
                        .action-cell {
                            border-top: 1px solid var(--border-color) !important;
                            margin-top: 1rem !important;
                            padding-top: 1.5rem !important;
                            justify-content: center !important;
                        }
                    }

                    .admin-modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.7);
                        backdrop-filter: blur(8px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 10001;
                        padding: 1rem;
                    }

                    .admin-modal-content {
                        background: var(--bg-primary);
                        border: 1px solid var(--glass-border);
                        border-radius: 24px;
                        width: 100%;
                        max-width: 600px;
                        max-height: 90vh;
                        display: flex;
                        flex-direction: column;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                        position: relative;
                        color: var(--text-primary);
                        overflow: hidden;
                    }

                    .modal-header {
                        padding: 2rem 2.5rem;
                        background: var(--bg-secondary);
                        border-bottom: 1px solid var(--border-color);
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        flex-shrink: 0;
                    }

                    .modal-body {
                        padding: 2rem 2.5rem;
                        overflow-y: auto;
                        flex: 1;
                    }

                    .modal-footer {
                        padding: 1.5rem 2.5rem;
                        background: var(--bg-secondary);
                        border-top: 1px solid var(--border-color);
                        display: flex;
                        gap: 1rem;
                        flex-shrink: 0;
                    }

                    .modal-section {
                        margin-bottom: 2.5rem;
                    }

                    .modal-section-title {
                        font-size: 0.9rem;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        color: var(--text-secondary);
                        margin-bottom: 1.2rem;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    }

                    .form-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 1.2rem;
                    }

                    @media (max-width: 768px) {
                        .admin-modal-content {
                            max-height: 95vh;
                            border-radius: 20px;
                        }
                        .modal-header {
                            padding: 1.5rem;
                            flex-direction: column;
                            gap: 1rem;
                            text-align: center;
                        }
                        .modal-header h3 {
                            justify-content: center !important;
                        }
                        .modal-body {
                            padding: 1.5rem;
                        }
                        .modal-footer {
                            padding: 1.5rem;
                            flex-direction: column;
                        }
                        .form-grid {
                            grid-template-columns: 1fr;
                        }
                        .modal-section {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            text-align: center;
                        }
                        .modal-section-title {
                            justify-content: center;
                            width: 100%;
                        }
                        .form-label {
                            text-align: center !important;
                            width: 100%;
                        }
                        .form-input {
                            text-align: center !important;
                        }
                        .form-input.has-icon {
                            padding-left: 1rem !important; /* Center text more effectively */
                        }
                        .form-input-icon {
                            display: none; /* Hide icons in input for cleaner centered look on mobile */
                        }
                    }

                    .action-icon-btn {
                        width: 36px;
                        height: 36px;
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border: 1px solid var(--border-color);
                        background: var(--bg-secondary);
                        color: var(--text-secondary);
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .action-icon-btn:hover {
                        background: var(--bg-primary);
                        border-color: var(--accent-color);
                        color: var(--accent-color);
                        transform: translateY(-2px);
                    }
                    .action-icon-btn.delete:hover {
                        border-color: #ef4444;
                        color: #ef4444;
                    }
                `}
            </style>

            <div className="glass" style={{ overflowX: 'auto', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                <table className="users-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>{t.dashboard.admin.users.name}</th>
                            <th style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>{t.dashboard.admin.users.email}</th>
                            <th style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>{t.dashboard.admin.users.role}</th>
                            <th style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>{t.dashboard.admin.users.lastSeen}</th>
                            <th style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600', textAlign: 'right' }}>{language === 'tr' ? 'İşlemler' : 'Actions'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                                <td style={{ padding: '1.5rem' }} data-label={t.dashboard.admin.users.name}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '12px',
                                            background: user.role === 'admin' ? 'var(--accent-gradient)' : 'var(--bg-primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: user.role === 'admin' ? 'white' : 'var(--text-secondary)',
                                            flexShrink: 0
                                        }}>
                                            <FiUser />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{user.displayName || 'Unknown'}</span>
                                            {user.jobTitle && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.jobTitle}</span>}
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem', color: 'var(--text-secondary)' }} data-label={t.dashboard.admin.users.email}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', wordBreak: 'break-all' }}>
                                        <FiMail style={{ flexShrink: 0 }} />
                                        {user.email}
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem' }} data-label={t.dashboard.admin.users.role}>
                                    <span style={{
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '10px',
                                        fontSize: '0.8rem',
                                        fontWeight: '700',
                                        background: user.role === 'admin' ? 'rgba(124, 58, 237, 0.1)' : 'rgba(0,0,0,0.05)',
                                        color: user.role === 'admin' ? 'var(--accent-color)' : 'var(--text-secondary)',
                                        border: '1px solid',
                                        borderColor: user.role === 'admin' ? 'rgba(124, 58, 237, 0.2)' : 'var(--border-color)'
                                    }}>
                                        {user.role === 'admin' ? t.dashboard.settings.admin : t.dashboard.settings.member}
                                    </span>
                                </td>
                                <td style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }} data-label={t.dashboard.admin.users.lastSeen}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <FiClock style={{ flexShrink: 0 }} />
                                        {formatDate(user.lastLogin)}
                                    </div>
                                </td>
                                <td className="action-cell" style={{ padding: '1.5rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button onClick={() => handleOpenEditModal(user)} className="action-icon-btn" title="Düzenle">
                                            <FiEdit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDeleteUser(user)} className="action-icon-btn delete" title="Sil">
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ENHANCED ADMİN MODAL */}
            {showModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content">
                        <div className="modal-header">
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                {modalType === 'edit' ? <FiEdit2 /> : <FiPlus />}
                                {modalType === 'edit' ? (language === 'tr' ? 'Kullanıcı Düzenle' : 'Edit User') : (language === 'tr' ? 'Yeni Kullanıcı' : 'New User')}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <form id="admin-user-form" onSubmit={handleSaveUser}>
                                {/* SECTION: Account Info */}
                                <div className="modal-section">
                                    <h4 className="modal-section-title"><FiUser /> {language === 'tr' ? 'Hesap Bilgileri' : 'Account Info'}</h4>
                                    <div className="form-grid">
                                        <div>
                                            <label className="form-label">{t.dashboard.settings.displayName}</label>
                                            <input
                                                type="text"
                                                required
                                                className="form-input"
                                                value={formData.displayName}
                                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">{t.dashboard.settings.email}</label>
                                            <input
                                                type="email"
                                                required
                                                className="form-input"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        {modalType === 'add' && (
                                            <div>
                                                <label className="form-label">{language === 'tr' ? 'Şifre' : 'Password'}</label>
                                                <input
                                                    type="password"
                                                    required={modalType === 'add'}
                                                    className="form-input"
                                                    placeholder="••••••••"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <label className="form-label">{t.dashboard.admin.users.role}</label>
                                            <select
                                                className="form-input"
                                                value={formData.role}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            >
                                                <option value="user">{t.dashboard.settings.member}</option>
                                                <option value="admin">{t.dashboard.settings.admin}</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="form-label">{t.dashboard.settings.jobTitle}</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={formData.jobTitle}
                                                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION: Contact & Details */}
                                <div className="modal-section">
                                    <h4 className="modal-section-title"><FiGlobe /> {language === 'tr' ? 'Detaylar & İletişim' : 'Contact & Details'}</h4>
                                    <div className="form-grid">
                                        <div>
                                            <label className="form-label">{t.dashboard.settings.phone}</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">{t.dashboard.settings.website}</label>
                                            <input
                                                type="url"
                                                className="form-input"
                                                placeholder="https://example.com"
                                                value={formData.website}
                                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            />
                                        </div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label className="form-label">{t.dashboard.settings.timezone}</label>
                                            <select
                                                value={formData.timezone}
                                                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                                className="form-input"
                                            >
                                                <option value="Europe/Istanbul">Europe/Istanbul (GMT+3)</option>
                                                <option value="Europe/London">Europe/London (GMT+0)</option>
                                                <option value="America/New_York">America/New_York (GMT-5)</option>
                                                <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '1.2rem' }}>
                                        <label className="form-label">{t.dashboard.settings.bio}</label>
                                        <textarea
                                            rows={3}
                                            className="form-input form-textarea"
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* SECTION: Socials */}
                                <div className="modal-section">
                                    <h4 className="modal-section-title"><FiMessageSquare /> {language === 'tr' ? 'Sosyal Medya' : 'Social Media'}</h4>
                                    <div className="form-grid">
                                        <div className="form-input-wrapper">
                                            <FiTwitter className="form-input-icon" />
                                            <input
                                                type="text"
                                                className="form-input has-icon"
                                                placeholder="@twitter"
                                                value={formData.socials.twitter}
                                                onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, twitter: e.target.value } })}
                                            />
                                        </div>
                                        <div className="form-input-wrapper">
                                            <FiGithub className="form-input-icon" />
                                            <input
                                                type="text"
                                                className="form-input has-icon"
                                                placeholder="github_user"
                                                value={formData.socials.github}
                                                onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, github: e.target.value } })}
                                            />
                                        </div>
                                        <div className="form-input-wrapper" style={{ gridColumn: 'span 2' }}>
                                            <FiLinkedin className="form-input-icon" />
                                            <input
                                                type="text"
                                                className="form-input has-icon"
                                                placeholder="linkedin_profile"
                                                value={formData.socials.linkedin}
                                                onChange={(e) => setFormData({ ...formData, socials: { ...formData.socials, linkedin: e.target.value } })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION: Appearance */}
                                <div className="modal-section" style={{ marginBottom: '1rem' }}>
                                    <h4 className="modal-section-title"><FiImage /> {language === 'tr' ? 'Görünüm' : 'Appearance'}</h4>
                                    <div>
                                        <label className="form-label">{t.dashboard.settings.coverImage}</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="https://example.com/image.jpg"
                                            value={formData.coverImage}
                                            onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="btn-secondary"
                                style={{ flex: 1 }}
                            >
                                {language === 'tr' ? 'Vazgeç' : 'Cancel'}
                            </button>
                            <button
                                type="submit"
                                form="admin-user-form"
                                disabled={actionLoading}
                                className="btn-primary-action"
                                style={{ flex: 1 }}
                            >
                                {actionLoading ? '...' : (language === 'tr' ? 'Kaydet' : 'Save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersContent;


