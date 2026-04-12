'use client';

import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';
import { FiMail, FiMapPin, FiSend } from 'react-icons/fi';
import emailjs from '@emailjs/browser';

export default function Contact() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      alert("Hata: Değişkenler yüklenemedi. Lütfen Cloudflare panelinden Environment Variables ayarlarını kontrol edin ve tekrar build edin.");
      return;
    }

    setLoading(true);
    
    emailjs.send(
      serviceId,
      templateId,
      {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.message,
      },
      publicKey
    )
    .then((result) => {
      setSuccess(true);
      setLoading(false);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    }, (error) => {
      console.error("EmailJS Error:", error);
      setLoading(false);
      alert(`Mesaj gönderilemedi. Hata detayı: ${error?.text || 'Bilinmeyen hata'}`);
    });
  };

  return (
    <section id="contact" style={{ padding: '6rem 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 className="section-title">{t?.contact?.title || 'İletişim'}</h2>
          <div style={{ width: 60, height: 4, background: 'var(--accent-gradient)', margin: '0 auto', borderRadius: 2 }} />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', maxWidth: 1000, margin: '0 auto' }}>
          
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ width: 60, height: 60, borderRadius: 'var(--radius-lg)', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <FiMail style={{ fontSize: '1.8rem', color: 'var(--accent)' }} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 600 }}>E-posta</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Bana doğrudan e-posta gönderebilirsiniz.</p>
              <a href="mailto:info@yunusemredemirtas.com" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>info@yunusemredemirtas.com</a>
            </div>
            <div className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ width: 60, height: 60, borderRadius: 'var(--radius-lg)', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <FiMapPin style={{ fontSize: '1.8rem', color: 'var(--accent-blue)' }} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 600 }}>Konum</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Şu anlık uzaktan çalışıyorum ancak lokasyonum burada.</p>
              <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>İstanbul, Türkiye</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="glass" style={{ flex: '2 1 400px', padding: '3rem', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Bana Bir Mesaj Bırakın</h3>
            <div>
              <label className="form-label">{t?.contact?.name}</label>
              <input required type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Adınız Soyadınız" />
            </div>
            <div>
              <label className="form-label">{t?.contact?.email}</label>
              <input required type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="ornek@email.com" />
            </div>
            <div>
              <label className="form-label">{t?.contact?.message}</label>
              <textarea required rows={5} className="form-input" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="Hayalinizdeki projeyi anlatın..." />
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>
              <FiSend /> {loading ? 'Gönderiliyor...' : t?.contact?.send}
            </button>
            {success && <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(34, 197, 94, 0.2)', textAlign: 'center', marginTop: '1rem', fontWeight: 500 }}>{t?.contact?.success}</div>}
          </form>

        </div>
      </div>
    </section>
  );
}
