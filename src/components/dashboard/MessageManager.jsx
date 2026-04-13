'use client';
import { useState, useEffect } from 'react';
import { FiMail, FiTrash2, FiCheckCircle, FiClock, FiUser, FiInfo } from 'react-icons/fi';
import pb from '../../lib/pocketbase';

export default function MessageManager() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection('messages').getFullList({
        sort: '-created'
      });
      setMessages(records || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
    setIsLoading(false);
  };

  const toggleReadStatus = async (message) => {
    try {
      const newStatus = message.status === 'read' ? 'unread' : 'read';
      const updated = await pb.collection('messages').update(message.id, {
        status: newStatus
      });
      setMessages(prev => prev.map(m => m.id === message.id ? updated : m));
      if (selectedMessage?.id === message.id) setSelectedMessage(updated);
    } catch (error) {
      alert('Durum güncelleme hatası.');
    }
  };

  const deleteMessage = async (messageId) => {
    if (window.confirm('Bu mesajı silmek istediğinize emin misiniz?')) {
      try {
        await pb.collection('messages').delete(messageId);
        setMessages(prev => prev.filter(m => m.id !== messageId));
        if (selectedMessage?.id === messageId) setSelectedMessage(null);
      } catch (error) {
        alert('Silme hatası.');
      }
    }
  };

  return (
    <div className="animate-fade">
      <header style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-1.5px', marginBottom: '0.5rem' }}>Mesaj Kutusu</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Gelen iletişim talepleri ve mesajlar.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: messages.length > 0 ? '400px 1fr' : '1fr', gap: '2rem' }}>
        {/* Messages List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isLoading ? (
            <p>Mesajlar yükleniyor...</p>
          ) : messages.length === 0 ? (
            <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-xl)', borderStyle: 'dashed' }}>
                <FiMail style={{ fontSize: '2.5rem', opacity: 0.2, marginBottom: '1rem' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Henüz bir mesajınız bulunmuyor.</p>
            </div>
          ) : (
            messages.map(msg => (
              <div 
                key={msg.id}
                onClick={() => {
                    setSelectedMessage(msg);
                    if (msg.status === 'unread') toggleReadStatus(msg);
                }}
                className={`glass card-hover ${selectedMessage?.id === msg.id ? 'active-card' : ''}`}
                style={{ 
                    padding: '1.5rem', borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                    border: selectedMessage?.id === msg.id ? '2px solid var(--accent)' : '1px solid var(--glass-border)',
                    position: 'relative',
                    transition: 'all 0.3s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: msg.status === 'unread' ? '#fff' : 'var(--text-secondary)' }}>{msg.name}</h4>
                  {msg.status === 'unread' && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }} />}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{msg.email}</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', opacity: msg.status === 'unread' ? 1 : 0.6 }}>
                    {msg.message}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '1rem', textAlign: 'right' }}>
                    {new Date(msg.created).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Message Detail View */}
        <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '3rem', minHeight: 600, display: 'flex', flexDirection: 'column' }}>
          {selectedMessage ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
                        {selectedMessage.name[0]?.toUpperCase()}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{selectedMessage.name}</h3>
                        <p style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{selectedMessage.email}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                        onClick={() => toggleReadStatus(selectedMessage)} 
                        style={{ padding: '0.75rem 1.25rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {selectedMessage.status === 'read' ? <><FiClock /> Okunmadı Yap</> : <><FiCheckCircle /> Okundu Yap</>}
                    </button>
                    <button 
                        onClick={() => deleteMessage(selectedMessage.id)} 
                        style={{ padding: '0.75rem 1.25rem', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <FiTrash2 /> Sil
                    </button>
                </div>
              </div>

              <div style={{ flex: 1, padding: '2.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '1.15rem' }}>
                  {selectedMessage.message}
              </div>

              <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end', opacity: 0.5, fontSize: '0.9rem' }}>
                  Gönderilme Tarihi: {new Date(selectedMessage.created).toLocaleString()}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                <FiInfo style={{ fontSize: '4rem', marginBottom: '1.5rem' }} />
                <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>Detayları görmek için bir mesaj şeçin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
