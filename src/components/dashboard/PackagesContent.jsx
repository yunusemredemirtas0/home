import React from 'react';
import { FiCheck, FiZap, FiServer, FiActivity } from 'react-icons/fi';

const PackagesContent = ({ t }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    {t.dashboard.packages.title}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    {t.dashboard.packages.subtitle}
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem'
            }}>
                {t.dashboard.packages.plans.map((plan) => (
                    <div key={plan.id} style={{
                        background: 'var(--bg-secondary)',
                        borderRadius: '24px',
                        padding: '2rem',
                        border: plan.popular ? '2px solid' : '1px solid var(--border-color)',
                        borderColor: plan.popular ? 'var(--accent-color)' : 'var(--border-color)',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        boxShadow: plan.popular ? '0 10px 40px -10px rgba(124, 58, 237, 0.2)' : 'none'
                    }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 20px 40px -5px rgba(0,0,0,0.1)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = plan.popular ? '0 10px 40px -10px rgba(124, 58, 237, 0.2)' : 'none';
                        }}
                    >
                        {plan.popular && (
                            <div style={{
                                position: 'absolute',
                                top: '-12px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'var(--accent-gradient)',
                                color: 'white',
                                padding: '0.4rem 1rem',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                letterSpacing: '0.5px'
                            }}>
                                POPULAR
                            </div>
                        )}

                        <div>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '14px',
                                background: plan.id === 'enterprise' ? 'rgba(16, 185, 129, 0.1)' : (plan.popular ? 'rgba(124, 58, 237, 0.1)' : 'rgba(59, 130, 246, 0.1)'),
                                color: plan.id === 'enterprise' ? '#10b981' : (plan.popular ? '#7c3aed' : '#3b82f6'),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                marginBottom: '1rem'
                            }}>
                                {plan.id === 'enterprise' ? <FiServer /> : (plan.popular ? <FiZap /> : <FiActivity />)}
                            </div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)' }}>{plan.name}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem', minHeight: '3rem' }}>
                                {plan.description}
                            </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                            <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>{plan.price}</span>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>{plan.period}</span>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                                {t.dashboard.packages.features}
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                                        <FiCheck style={{ color: '#10b981', flexShrink: 0 }} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '14px',
                            background: plan.popular ? 'var(--accent-gradient)' : 'var(--bg-primary)',
                            color: plan.popular ? 'white' : 'var(--text-primary)',
                            border: plan.popular ? 'none' : '1px solid var(--border-color)',
                            fontWeight: '700',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            marginTop: 'auto'
                        }}
                            onMouseOver={(e) => {
                                if (!plan.popular) {
                                    e.currentTarget.style.background = 'var(--bg-secondary)';
                                    e.currentTarget.style.borderColor = 'var(--text-primary)';
                                }
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseOut={(e) => {
                                if (!plan.popular) {
                                    e.currentTarget.style.background = 'var(--bg-primary)';
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                }
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            {t.dashboard.packages.subscribe}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PackagesContent;
