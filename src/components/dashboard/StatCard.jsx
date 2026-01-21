import React from 'react';

const StatCard = ({ title, value, icon, color, trend }) => (
    <div className="glass" style={{
        padding: '1.8rem',
        borderRadius: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
        transition: 'transform 0.3s ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden'
    }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
        {/* Decorative Background Icon */}
        <div style={{
            position: 'absolute',
            right: '-10px',
            bottom: '-10px',
            fontSize: '5rem',
            opacity: 0.03,
            color: `rgb(${color})`,
            transform: 'rotate(-15deg)'
        }}>
            {icon}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: `rgba(${color}, 0.1)`,
                color: `rgb(${color})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                boxShadow: `0 8px 20px -6px rgba(${color}, 0.3)`
            }}>
                {icon}
            </div>
            {trend && (
                <div style={{
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    color: trend.startsWith('+') ? '#10b981' : (trend === '0%' ? 'var(--text-secondary)' : '#ef4444'),
                    background: trend.startsWith('+') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.05)',
                    padding: '4px 10px',
                    borderRadius: '20px'
                }}>
                    {trend}
                </div>
            )}
        </div>

        <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>{title}</div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-1px' }}>{value}</div>
        </div>

        {/* Mock Sparkline SVG */}
        <div style={{ marginTop: '0.5rem', width: '100%', height: '30px' }}>
            <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                <path
                    d="M0 25 Q 15 28, 30 15 T 60 20 T 100 5"
                    fill="none"
                    stroke={`rgb(${color})`}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{ opacity: 0.6 }}
                />
            </svg>
        </div>
    </div>
);

export default StatCard;
