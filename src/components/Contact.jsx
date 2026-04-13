'use client';
import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import emailjs from '@emailjs/browser';
import { CONFIG } from '../lib/config';

export default function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    emailjs.send(CONFIG.EMAILJS.SERVICE_ID, CONFIG.EMAILJS.TEMPLATE_ID, { from_name: formData.name, from_email: formData.email, message: formData.message }, CONFIG.EMAILJS.PUBLIC_KEY)
    .then(() => { setSuccess(true); setLoading(false); setFormData({ name: '', email: '', message: '' }); setTimeout(() => setSuccess(false), 5000); })
    .catch(() => setLoading(false));
  };

  return (
    <section id="contact" style={{ padding: '6rem 0' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <h2 className="section-title" style={{ textAlign: 'center' }}>{t?.contact?.title}</h2>
        <form onSubmit={handleSubmit} className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)', marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div><label className="form-label">{t?.contact?.name}</label><input required className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
          <div><label className="form-label">{t?.contact?.email}</label><input required type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
          <div><label className="form-label">{t?.contact?.message}</label><textarea required rows={5} className="form-input" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} /></div>
          <button type="submit" disabled={loading} className="btn-primary"><FiSend /> {loading ? '...' : t?.contact?.send}</button>
          {success && <div style={{ color: 'var(--success)', textAlign: 'center' }}>{t?.contact?.success}</div>}
        </form>
      </div>
    </section>
  );
}
