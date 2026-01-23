import React, { useState, useEffect, useRef } from 'react';
import { FiPlus, FiMessageSquare, FiClock, FiCheckCircle, FiUser, FiSend, FiX, FiArrowLeft, FiTrash2, FiSearch, FiActivity, FiMail, FiGlobe, FiTwitter, FiLinkedin, FiGithub } from 'react-icons/fi';
import { createTicket, streamTickets, streamMessages, addTicketMessage, updateTicketStatus, markTicketAsRead, deleteTicket } from '../../services/db';
import './SupportContent.css';

export default function SupportContent({ t, currentUser, isAdmin }) {
    const [activeTab, setActiveTab] = useState('help'); // help, tickets, status, contact
    const [ticketView, setTicketView] = useState('list'); // 'list', 'create', 'detail'

    // Help Center State
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFaq, setExpandedFaq] = useState(null);

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusMsg, setStatusMsg] = useState(null);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef(null);

    // FAQ Data from Translations
    const faqs = t.dashboard.support.faqsList || [];

    const systemStatus = {
        overall: 'operational', // working, maintenance, outage
        services: [
            { id: 'api', status: 'operational' },
            { id: 'db', status: 'operational' },
            { id: 'storage', status: 'operational' },
            { id: 'cdn', status: 'maintenance' },
            { id: 'auth', status: 'operational' }
        ],
        uptime: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.5, 1, 1] // 1=up, 0=down, 0.5=incident
    };

    // Derive selectedTicket from tickets array to stay synced with real-time stream
    const selectedTicket = tickets.find(ticket => ticket.id === selectedTicketId);

    // Form State for new ticket
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');

    // Ticket Stream Subscription
    useEffect(() => {
        if (!currentUser) return;

        console.log("Initializing tickets stream...");
        const unsubscribe = streamTickets(currentUser.uid, isAdmin, (data) => {
            console.log("Tickets updated:", data.length);
            setTickets(data);
            setLoading(false);
        });

        return () => {
            console.log("Cleaning up tickets stream");
            unsubscribe();
        };
    }, [currentUser?.uid, isAdmin]);

    // Message Stream Subscription
    useEffect(() => {
        if (!selectedTicketId || ticketView !== 'detail') {
            setMessages([]);
            return;
        }

        console.log("Initializing messages stream for:", selectedTicketId);
        const unsubscribe = streamMessages(selectedTicketId, (data) => {
            console.log("Messages updated for ticket:", selectedTicketId, data.length);
            setMessages(data);
            // Mark as read whenever new messages arrive while viewing
            markTicketAsRead(selectedTicketId, isAdmin);
        });

        return () => {
            console.log("Cleaning up messages stream for:", selectedTicketId);
            unsubscribe();
        };
    }, [selectedTicketId, ticketView, isAdmin]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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
                setTicketView('list');
            }, 1000);
        } catch (error) {
            console.error("Error creating ticket:", error);
            setStatusMsg({ type: 'error', msg: t.dashboard.settings.error });
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicketId) return;

        try {
            await addTicketMessage(selectedTicketId, currentUser.uid, currentUser.email, newMessage, isAdmin);
            setNewMessage('');
            // No need to manually load, stream will update
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        if (!selectedTicketId) return;
        try {
            await updateTicketStatus(selectedTicketId, newStatus);
            // selectedTicket will update automatically via stream
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleDeleteTicket = async (e, ticketId) => {
        e.stopPropagation(); // Prevent opening the ticket when clicking delete in list
        if (window.confirm(t.dashboard.support.confirmDelete)) {
            try {
                await deleteTicket(ticketId);
                if (selectedTicketId === ticketId) {
                    setTicketView('list');
                    setSelectedTicketId(null);
                }
            } catch (error) {
                console.error("Error deleting ticket:", error);
            }
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '-';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
        });
    };

    const openTicket = (ticket) => {
        setSelectedTicketId(ticket.id);
        setTicketView('detail');
        markTicketAsRead(ticket.id, isAdmin);
    };

    const toggleFaq = (id) => {
        setExpandedFaq(expandedFaq === id ? null : id);
    };

    const filteredFaqs = faqs.filter(f => f.q.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="support-container">

            {/* Navigation Tabs */}
            <div className="support-tabs">
                {[
                    { id: 'help', label: t.dashboard.support.helpCenter, icon: FiSearch },
                    { id: 'tickets', label: t.dashboard.support.myTickets, icon: FiMessageSquare },
                    { id: 'status', label: t.dashboard.support.systemStatus, icon: FiActivity },
                    { id: 'contact', label: t.dashboard.support.contactUs, icon: FiMail },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`support-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    >
                        <tab.icon /> {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB: HELP CENTER (FAQ) */}
            {activeTab === 'help' && (
                <div className="help-center-tab">
                    <div className="faq-search-container">
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{t.dashboard.support.howCanWeHelp}</h2>
                        <input
                            type="text"
                            placeholder={t.dashboard.support.searchFaq}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="faq-search-input"
                        />
                    </div>

                    <h3 className="section-header" style={{ marginBottom: '1.5rem' }}>{t.dashboard.support.faq}</h3>
                    <div className="faq-grid">
                        {filteredFaqs.map(faq => (
                            <div key={faq.id} className="faq-card" onClick={() => toggleFaq(faq.id)}>
                                <div className="faq-question">{faq.q}</div>
                                <div className="faq-answer" style={{ display: expandedFaq === faq.id || searchQuery ? 'block' : 'none' }}>
                                    {faq.a}
                                </div>
                                {!searchQuery && expandedFaq !== faq.id && (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-color)', marginTop: '0.5rem' }}>{t.dashboard.support.clickToExpand}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB: SYSTEM STATUS */}
            {activeTab === 'status' && (
                <div className="status-tab">
                    <div className="status-overview-card">
                        <div className="status-large-icon status-operational">
                            <FiCheckCircle />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{t.dashboard.support.operational}</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>{t.dashboard.support.statusOperational}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <h3 className="section-header" style={{ marginBottom: '1rem' }}>{t.dashboard.support.servicesLabel}</h3>
                            <div className="status-list">
                                {systemStatus.services.map((svc, idx) => (
                                    <div key={idx} className="status-item">
                                        <span style={{ fontWeight: '600' }}>{t.dashboard.support.serviceNames[svc.id]}</span>
                                        <span className={`status-chip ${svc.status === 'operational' ? 'status-paid' : 'status-pending'}`}>
                                            {svc.status === 'operational' ? t.dashboard.support.statusOperational : t.dashboard.support.statusMaintenance}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="section-header" style={{ marginBottom: '1rem' }}>{t.dashboard.support.uptime}</h3>
                            <div className="uptime-bar-container">
                                <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>99.9%</span>
                                <div className="uptime-bar">
                                    {systemStatus.uptime.map((status, i) => (
                                        <div key={i} className={`uptime-day ${status === 1 ? '' : (status === 0 ? 'down' : 'incident')}`} title={`Day ${i + 1}`}></div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                    <span>{t.dashboard.support.daysAgo30}</span>
                                    <span>{t.dashboard.support.today}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: CONTACT US */}
            {activeTab === 'contact' && (
                <div className="contact-tab">
                    <div className="contact-grid">
                        <div className="contact-card">
                            <div className="contact-icon-wrapper"><FiMessageSquare /></div>
                            <h3>{t.dashboard.support.liveChatTitle}</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>{t.dashboard.support.liveChatDesc}</p>
                            <button className="btn-primary live-chat-cta">
                                {t.dashboard.support.liveChatBtn}
                            </button>
                        </div>
                        <div className="contact-card">
                            <div className="contact-icon-wrapper"><FiMail /></div>
                            <h3>{t.dashboard.support.emailSupportTitle}</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>support@antigravity.com</p>
                            <button className="btn-secondary-glass">{t.dashboard.support.emailUs}</button>
                        </div>
                        <div className="contact-card">
                            <div className="contact-icon-wrapper"><FiGlobe /></div>
                            <h3>{t.dashboard.support.socialMediaTitle}</h3>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <button className="btn-icon-back"><FiTwitter size={20} /></button>
                                <button className="btn-icon-back"><FiLinkedin size={20} /></button>
                                <button className="btn-icon-back"><FiGithub size={20} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: TICKETS (Existing Logic) */}
            {activeTab === 'tickets' && (
                <div className="tickets-tab-content">
                    {/* Header / Actions */}
                    <div className="support-header">
                        <div className="support-title">
                            {ticketView === 'detail' ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <button onClick={() => { setTicketView('list'); setSelectedTicketId(null); }} className="btn-icon-back">
                                        <FiArrowLeft />
                                    </button>
                                    <div>
                                        <h2>{selectedTicket?.subject || '...'}</h2>
                                        <p>ID: #{selectedTicketId?.slice(-6)}</p>
                                    </div>
                                    <button onClick={(e) => handleDeleteTicket(e, selectedTicketId)} className="btn-delete-ticket" title="Talebi Sil">
                                        <FiTrash2 />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2>{isAdmin ? t.dashboard.support.adminView : t.dashboard.support.title}</h2>
                                    <p>{isAdmin ? t.dashboard.support.adminOnly : t.dashboard.support.myTickets}</p>
                                </>
                            )}
                        </div>

                        {!isAdmin && ticketView === 'list' && (
                            <button onClick={() => setTicketView('create')} className="btn-primary">
                                <FiPlus /> {t.dashboard.support.newTicket}
                            </button>
                        )}

                        {ticketView === 'create' && (
                            <button onClick={() => setTicketView('list')} className="btn-secondary-glass">
                                {t.dashboard.settings.back || 'Back'}
                            </button>
                        )}
                    </div>

                    {/* Content Area */}
                    {ticketView === 'list' && (
                        <div className="ticket-list">
                            {loading ? (
                                <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
                            ) : tickets.length === 0 ? (
                                <div className="empty-state">
                                    <FiMessageSquare style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '1rem' }} />
                                    <p>{t.dashboard.support.noTickets}</p>
                                </div>
                            ) : (
                                tickets.map(ticket => (
                                    <div key={ticket.id} className="ticket-card glass" onClick={() => openTicket(ticket)}>
                                        <div className="ticket-info">
                                            <div className={`ticket-icon ${ticket.status}`}>
                                                {ticket.status === 'open' ? <FiMessageSquare size={24} /> : <FiCheckCircle size={24} />}
                                            </div>
                                            <div className="ticket-details">
                                                <h4>{ticket.subject}</h4>
                                                <div className="ticket-meta">
                                                    <span className="meta-item">
                                                        <FiClock size={14} /> {formatDate(ticket.createdAt)}
                                                    </span>
                                                    {isAdmin && (
                                                        <span className="meta-item">
                                                            <FiUser size={14} /> {ticket.userEmail}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ticket-actions">
                                            <div className={`ticket-status ${ticket.status}`}>
                                                {ticket.status === 'open' ? t.dashboard.support.open : (ticket.status === 'resolved' ? 'Çözüldü' : t.dashboard.support.closed)}
                                                {((isAdmin && ticket.unreadForAdmin) || (!isAdmin && ticket.unreadForUser)) && (
                                                    <span className="unread-badge"></span>
                                                )}
                                            </div>
                                            <button onClick={(e) => handleDeleteTicket(e, ticket.id)} className="btn-icon-delete" title="Sil">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {ticketView === 'detail' && selectedTicket && (
                        <div className="ticket-detail-container glass">
                            <div className="ticket-original-message">
                                <div className="message-header">
                                    <span className="user">{selectedTicket.userEmail}</span>
                                    <span className="date">{formatDate(selectedTicket.createdAt)}</span>
                                </div>
                                <p className="message-content">{selectedTicket.content}</p>
                            </div>

                            <div className="messages-thread">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`message-bubble ${msg.userId === currentUser.uid ? 'own' : 'other'}`}>
                                        <div className="bubble-content">
                                            <p>{msg.message}</p>
                                            <span className="bubble-meta">{formatDate(msg.createdAt)}</span>
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>

                            {selectedTicket.status === 'open' ? (
                                <div className="message-input-container">
                                    <form onSubmit={handleSendMessage} className="message-input-area">
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder={t.dashboard.support.messagePlaceholder}
                                            className="chat-input"
                                            rows={1}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage(e);
                                                }
                                            }}
                                        />
                                        <button type="submit" className="btn-send" disabled={!newMessage.trim()}>
                                            <FiSend />
                                        </button>
                                    </form>
                                    <p className="chat-tip">{t.dashboard.support.chatTip}</p>
                                </div>
                            ) : (
                                <div className="ticket-closed-notice">
                                    {selectedTicket.status === 'resolved' ? t.dashboard.support.ticketResolvedNotice : t.dashboard.support.ticketClosedNotice}
                                </div>
                            )}

                            {isAdmin && (selectedTicket.status === 'open') && (
                                <div className="admin-actions-bar">
                                    <button onClick={() => handleStatusUpdate('closed')} className="btn-status-close">
                                        <FiX /> {t.dashboard.support.closeTicket}
                                    </button>
                                    <button onClick={() => handleStatusUpdate('resolved')} className="btn-status-resolve">
                                        <FiCheckCircle /> {t.dashboard.support.answered}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {ticketView === 'create' && (
                        <div className="create-ticket-container glass">
                            <form onSubmit={handleSubmit} className="ticket-form">
                                <div className="form-group">
                                    <label className="form-label">{t.dashboard.support.subject}</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                        required
                                        placeholder={t.dashboard.support.placeholderSubject}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">{t.dashboard.support.create}</label>
                                    <textarea
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        required
                                        rows={6}
                                        placeholder={t.dashboard.support.placeholder}
                                        className="form-textarea"
                                    />
                                </div>

                                {statusMsg && (
                                    <div className={`status-message ${statusMsg.type}`}>
                                        {statusMsg.msg}
                                    </div>
                                )}

                                <button type="submit" disabled={loading} className="btn-submit">
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
            )}




        </div>
    );
}
