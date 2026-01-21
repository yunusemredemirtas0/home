import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getAllUsers } from '../../services/db';
import { FiUser, FiMail, FiClock, FiShield } from 'react-icons/fi';

const UsersContent = () => {
    const { t, language } = useLanguage();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getAllUsers();
                setUsers(data);
            } catch (err) {
                console.error('Failed to fetch users:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) return <div style={{ color: 'var(--text-secondary)' }}>{t.dashboard.admin.users.loading}</div>;

    const formatDate = (timestamp) => {
        if (!timestamp) return t.dashboard.admin.users.neverLogin;
        const date = timestamp.toDate();
        return new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    {t.dashboard.admin.users.title}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                    {t.dashboard.admin.users.subtitle}
                </p>
            </div>

            {/* Mobile Responsive Users Table Styles */}
            <style>
                {`
                    @media (max-width: 768px) {
                        .users-table thead { display: none; }
                        .users-table tbody tr {
                            display: flex;
                            flex-direction: column;
                            background: var(--bg-secondary);
                            margin-bottom: 1rem;
                            border-radius: 16px;
                            padding: 1rem;
                            border: 1px solid var(--border-color);
                        }
                        .users-table td {
                            padding: 0.5rem 0 !important;
                            border-bottom: none !important;
                            display: flex;
                            align-items: center;
                        }
                    }
                `}
            </style>

            <div className="glass" style={{ overflowX: 'auto', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                <table className="users-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>{t.dashboard.admin.users.name}</th>
                            <th style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>{t.dashboard.admin.users.email}</th>
                            <th style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>{t.dashboard.admin.users.role}</th>
                            <th style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>{t.dashboard.admin.users.lastSeen}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                                <td style={{ padding: '1.5rem' }}>
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
                                        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{user.displayName || 'Unknown'}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem', color: 'var(--text-secondary)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', wordBreak: 'break-all' }}>
                                        <FiMail style={{ flexShrink: 0 }} />
                                        {user.email}
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem' }}>
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
                                <td style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <FiClock style={{ flexShrink: 0 }} />
                                        {formatDate(user.lastLogin)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersContent;
