import React from 'react';
import { FiSettings, FiPlus } from 'react-icons/fi';

const ServiceCard = ({ service, t, handleConfigure, handleServiceActivation }) => (
    <div
        className="glass"
        style={{
            padding: '2rem',
            borderRadius: '32px',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--glass-shadow)',
            cursor: 'default'
        }}
        onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.borderColor = `rgba(${parseInt(service.color.slice(1, 3), 16)}, ${parseInt(service.color.slice(3, 5), 16)}, ${parseInt(service.color.slice(5, 7), 16)}, 0.3)`;
        }}
        onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'var(--glass-border)';
        }}
    >
        {/* Background Glow */}
        <div style={{
            position: 'absolute',
            top: '-20%',
            right: '-20%',
            width: '140px',
            height: '140px',
            background: `radial-gradient(circle, ${service.color}22 0%, transparent 70%)`,
            filter: 'blur(30px)',
            zIndex: 0
        }}></div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1, position: 'relative' }}>
            <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                background: service.bg,
                color: service.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem'
            }}>
                {service.icon}
            </div>
            <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{service.name}</h3>
                <span style={{
                    fontSize: '0.8rem',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: service.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: service.status === 'Active' ? '#10b981' : '#ef4444',
                    fontWeight: '600'
                }}>
                    {service.status === 'Active' ? t.dashboard.services.active : t.dashboard.services.available}
                </span>
            </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', minHeight: '3rem' }}>
            {service.desc}
        </p>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (service.status === 'Active') {
                        handleConfigure(service.configName || service.name);
                    } else {
                        handleServiceActivation(service.id);
                    }
                }}
                style={{
                    width: '100%',
                    padding: '0.9rem',
                    borderRadius: '14px',
                    background: service.status === 'Active' ? 'var(--bg-secondary)' : 'var(--accent-gradient)',
                    border: service.status === 'Active' ? '1px solid var(--border-color)' : 'none',
                    color: service.status === 'Active' ? 'var(--text-primary)' : 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}
            >
                {service.status === 'Active' ? <><FiSettings /> {t.dashboard.services.manage}</> : <><FiPlus /> {t.dashboard.services.activate}</>}
            </button>
        </div>
    </div>
);

export default ServiceCard;
