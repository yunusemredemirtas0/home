import React from 'react';

const SidebarItem = ({ id, icon, label, activeTab, navigate, setMobileMenuOpen, handleLogout, danger = false }) => {
    const isActive = activeTab === id;

    return (
        <button
            onClick={() => {
                if (id === 'logout') handleLogout();
                else {
                    const path = id === 'overview' ? '/dashboard' : `/dashboard/${id}`;
                    navigate(path);
                    setMobileMenuOpen(false);
                }
            }}
            style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 18px',
                borderRadius: '16px',
                background: isActive ? 'var(--accent-gradient)' : 'transparent',
                color: danger ? '#ef4444' : (isActive ? 'white' : 'var(--text-secondary)'),
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: isActive ? '700' : '600',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isActive ? '0 8px 16px -4px rgba(124, 58, 237, 0.4)' : 'none',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseOver={(e) => {
                if (!isActive && !danger) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                }
            }}
            onMouseOut={(e) => {
                if (!isActive && !danger) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                }
            }}
        >
            <span style={{
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                opacity: isActive ? 1 : 0.7
            }}>
                {icon}
            </span>
            <span style={{ letterSpacing: '0.2px' }}>{label}</span>
            {isActive && (
                <div style={{
                    position: 'absolute',
                    right: '8px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'white',
                    boxShadow: '0 0 10px white'
                }} />
            )}
        </button>
    );
};

export default SidebarItem;
