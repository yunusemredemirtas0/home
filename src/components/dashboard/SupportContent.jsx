import React, { useState, useEffect, useRef } from 'react';
import { FiPlus, FiMessageSquare, FiClock, FiCheckCircle, FiUser, FiSend, FiX, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import { createTicket, streamTickets, streamMessages, addTicketMessage, updateTicketStatus, markTicketAsRead, deleteTicket } from '../../services/db';
import './SupportContent.css';

export default function SupportContent({ t, currentUser, isAdmin }) {
    const [view, setView] = useState('list'); // 'list', 'create', 'detail'
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusMsg, setStatusMsg] = useState(null);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef(null);

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
        if (!selectedTicketId || view !== 'detail') {
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
    }, [selectedTicketId, view, isAdmin]);

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
                setView('list');
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
        if (window.confirm("Bu talebi kalıcı olarak silmek istediğinize emin misiniz?")) {
            try {
                await deleteTicket(ticketId);
                if (selectedTicketId === ticketId) {
                    setView('list');
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
        setView('detail');
        markTicketAsRead(ticket.id, isAdmin);
    };

    return (
        <div className="support-container">

            {/* Header / Actions */}
            <div className="support-header">
                <div className="support-title">
                    {view === 'detail' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button onClick={() => { setView('list'); setSelectedTicketId(null); }} className="btn-icon-back">
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

                {!isAdmin && view === 'list' && (
                    <button onClick={() => setView('create')} className="btn-primary">
                        <FiPlus /> {t.dashboard.support.newTicket}
                    </button>
                )}

                {view === 'create' && (
                    <button onClick={() => setView('list')} className="btn-secondary-glass">
                        {t.dashboard.settings.back || 'Back'}
                    </button>
                )}
            </div>

            {/* Content Area */}
            {view === 'list' && (
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

            {view === 'detail' && selectedTicket && (
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
                                    placeholder="Mesajınızı yazın..."
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
                            <p className="chat-tip">Shift + Enter ile alt satıra geçebilirsiniz</p>
                        </div>
                    ) : (
                        <div className="ticket-closed-notice">
                            Bu talep {selectedTicket.status === 'resolved' ? 'çözülmüş' : 'kapatılmış'}tir. Yeni bir mesaj gönderilemez.
                        </div>
                    )}

                    {isAdmin && (selectedTicket.status === 'open') && (
                        <div className="admin-actions-bar">
                            <button onClick={() => handleStatusUpdate('closed')} className="btn-status-close">
                                <FiX /> Talebi Kapat
                            </button>
                            <button onClick={() => handleStatusUpdate('resolved')} className="btn-status-resolve">
                                <FiCheckCircle /> Çözüldü Olarak İşaretle
                            </button>
                        </div>
                    )}
                </div>
            )}

            {view === 'create' && (
                <div className="create-ticket-container glass">
                    <form onSubmit={handleSubmit} className="ticket-form">
                        <div className="form-group">
                            <label className="form-label">{t.dashboard.support.subject}</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                required
                                placeholder="Örn: Sunucu bağlantı hatası"
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
    );
}
