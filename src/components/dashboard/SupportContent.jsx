import React, { useState, useEffect } from 'react';
import { FiPlus, FiMessageSquare, FiClock, FiCheckCircle, FiUser, FiSend, FiX } from 'react-icons/fi';
import { createTicket, getUserTickets, getAllTickets } from '../../services/db';

export default function SupportContent({ t, currentUser, isAdmin }) {
    const [view, setView] = useState('list'); // 'list' or 'create'
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusMsg, setStatusMsg] = useState(null);

    // Form State
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        loadTickets();
    }, [currentUser, isAdmin, view]);

    const loadTickets = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            let data = [];
            if (isAdmin) {
                // Admin sees ALL tickets
                data = await getAllTickets();
            } else {
                // User sees only OWN tickets
                data = await getUserTickets(currentUser.uid);
            }
            setTickets(data);
        } catch (error) {
            console.error("Error loading tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createTicket(currentUser.uid, currentUser.email, subject, content);
            setStatusMsg({ type: 'success', msg: t.dashboard.support.success });
            setSubject('');
            setContent('');
            setTimeout(() => {
                setStatusMsg(null);
                setView('list');
            }, 1000);
        } catch (error) {
            console.error(error);
            setStatusMsg({ type: 'error', msg: t.dashboard.settings.error });
            setLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '-';
        // Handle Firestore Timestamp or JS Date
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Header / Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        {isAdmin ? t.dashboard.support.adminView : t.dashboard.support.title}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {isAdmin ? t.dashboard.support.adminOnly : t.dashboard.support.myTickets}
                    </p>
                </div>

                {!isAdmin && view === 'list' && (
                    <button
                        onClick={() => setView('create')}
                        className="glass-button"
                        style={{
                            padding: '0.8rem 1.5rem',
                            borderRadius: '12px',
                            background: 'var(--accent-gradient)',
                            color: 'white',
                            border: 'none',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)'
                        }}
                    >
                        <FiPlus /> {t.dashboard.support.newTicket}
                    </button>
                )}

                {view === 'create' && (
                    <button
                        onClick={() => setView('list')}
                        className="glass-button"
                        style={{
                            padding: '0.8rem 1.5rem',
                            borderRadius: '12px',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {t.dashboard.settings.back || 'Back'}
                    </button>
                )}
            </div>

            {/* Content Area */}
            {view === 'list' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {loading ? (
                        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
                    ) : tickets.length === 0 ? (
                        <div style={{
                            padding: '3rem',
                            textAlign: 'center',
                            background: 'var(--bg-secondary)',
                            borderRadius: '20px',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-secondary)'
                        }}>
                            <FiMessageSquare style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '1rem' }} />
                            <p>{t.dashboard.support.noTickets}</p>
                        </div>
                    ) : (
                        tickets.map(ticket => (
                            <div key={ticket.id} className="glass" style={{
                                padding: '1.5rem',
                                borderRadius: '16px',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'transform 0.2s',
                                cursor: 'pointer',
                                flexWrap: 'wrap',
                                gap: '1rem'
                            }}
                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{
                                        padding: '0.8rem',
                                        borderRadius: '12px',
                                        background: ticket.status === 'open' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                                        color: ticket.status === 'open' ? '#10B981' : '#6B7280'
                                    }}>
                                        {ticket.status === 'open' ? <FiCheckCircle size={24} /> : <FiX size={24} />}
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                                            {ticket.subject}
                                        </h4>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                <FiClock size={14} /> {formatDate(ticket.createdAt)}
                                            </span>
                                            {isAdmin && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    <FiUser size={14} /> {ticket.userEmail}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    padding: '0.4rem 1rem',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    background: ticket.status === 'open' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                                    color: ticket.status === 'open' ? '#10B981' : '#6B7280'
                                }}>
                                    {ticket.status === 'open' ? t.dashboard.support.open : t.dashboard.support.closed}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="glass" style={{
                    padding: '2.5rem',
                    borderRadius: '24px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    maxWidth: '800px',
                    margin: '0 auto',
                    width: '100%'
                }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>
                                {t.dashboard.support.subject}
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                required
                                placeholder="Örn: Sunucu bağlantı hatası"
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    background: 'var(--bg-primary)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>
                                {t.dashboard.support.create}
                            </label>
                            <textarea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                required
                                rows={6}
                                placeholder={t.dashboard.support.placeholder}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    background: 'var(--bg-primary)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        {statusMsg && (
                            <div style={{
                                padding: '1rem',
                                borderRadius: '12px',
                                background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                color: statusMsg.type === 'success' ? '#10B981' : '#EF4444',
                                textAlign: 'center',
                                fontWeight: '600'
                            }}>
                                {statusMsg.msg}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '1rem',
                                borderRadius: '12px',
                                background: 'var(--accent-gradient)',
                                color: 'white',
                                border: 'none',
                                fontWeight: '700',
                                fontSize: '1rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginTop: '1rem',
                                transition: 'transform 0.2s',
                                boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)'
                            }}
                        >
                            {loading ? t.dashboard.settings.loading || '...' : (
                                <>
                                    <FiSend /> {t.dashboard.support.create}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
