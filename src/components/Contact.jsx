'use client';
import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import emailjs from '@emailjs/browser';
import { CONFIG } from '../lib/config';
import pb from '../lib/pocketbase';

export default function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Send via EmailJS
      await emailjs.send(
        CONFIG.EMAILJS.SERVICE_ID, 
        CONFIG.EMAILJS.TEMPLATE_ID, 
        { from_name: formData.name, from_email: formData.email, message: formData.message }, 
        CONFIG.EMAILJS.PUBLIC_KEY
      );

      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Contact form error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" style={{ padding: '8rem 0' }}>
      <div className="container" style={{ maxWidth: 900 }}>
        <h2 className="section-title" style={{ textAlign: 'center' }}>{t?.contact?.title}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', marginTop: '5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
             <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem' }}>E-posta</h4>
                <p style={{ color: 'var(--text-secondary)' }}>yunusemredemirtas.dev@gmail.com</p>
             </div>
             <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem' }}>Adres</h4>
                <p style={{ color: 'var(--text-secondary)' }}>Trabzon, Türkiye</p>
             </div>
          </div>
          <form onSubmit={handleSubmit} className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div><label className="form-label">{t?.contact?.name}</label><input required className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div><label className="form-label">{t?.contact?.email}</label><input required type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
            <div><label className="form-label">{t?.contact?.message}</label><textarea required rows={5} className="form-input" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} /></div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%' }}><FiSend /> {loading ? '...' : t?.contact?.send}</button>
            {success && <div style={{ color: 'var(--success)', textAlign: 'center', fontWeight: 600 }}>{t?.contact?.success}</div>}
          </form>
        </div>
      </div>
    </section>
  );
}
