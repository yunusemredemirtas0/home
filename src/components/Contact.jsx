import { useLanguage } from '../contexts/LanguageContext';
import { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { emailConfig } from '../config/emailConfig';

export default function Contact() {
    const { t } = useLanguage();
    const form = useRef();
    const [status, setStatus] = useState('idle'); // idle, sending, success, error

    const sendEmail = (e) => {
        e.preventDefault();
        setStatus('sending');

        // Check if keys are configured
        if (emailConfig.serviceId === 'YOUR_SERVICE_ID') {
            alert("EmailJS konfigürasyonu yapılmamış. Lütfen 'src/config/emailConfig.js' dosyasını güncelleyin.");
            setStatus('idle');
            return;
        }

        emailjs.sendForm(
            emailConfig.serviceId,
            emailConfig.templateId,
            form.current,
            emailConfig.publicKey
        )
            .then((result) => {
                console.log(result.text);
                setStatus('success');
                form.current.reset();
                setTimeout(() => setStatus('idle'), 5000); // Reset status after 5s
            }, (error) => {
                console.log(error.text);
                setStatus('error');
            });
    };

    return (
        <section id="contact" style={{ position: 'relative', overflow: 'hidden', padding: '6rem 0' }}>
            {/* Glow behind contact form */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 70%)',
                zIndex: -1
            }}></div>

            <div className="container" style={{ maxWidth: '800px' }}>
                <h2 style={{
                    fontSize: '3rem',
                    marginBottom: '3rem',
                    textAlign: 'center',
                    fontWeight: '800',
                    background: 'var(--accent-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    {t.contact.title}
                </h2>

                <div className="glass" style={{
                    padding: '3rem',
                    borderRadius: '30px',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                    <form ref={form} onSubmit={sendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <input
                                type="text"
                                name="user_name"
                                placeholder={t.contact.namePlaceholder}
                                required
                                style={{
                                    width: '100%',
                                    padding: '1.2rem',
                                    borderRadius: '16px',
                                    border: '1px solid var(--border-color)',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'border-color 0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
                            <input
                                type="email"
                                name="user_email"
                                placeholder={t.contact.emailPlaceholder}
                                required
                                style={{
                                    width: '100%',
                                    padding: '1.2rem',
                                    borderRadius: '16px',
                                    border: '1px solid var(--border-color)',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'border-color 0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                            />
                        </div>

                        {/* Subject Input */}
                        <input
                            type="text"
                            name="subject"
                            placeholder={t.contact.subjectPlaceholder}
                            required
                            style={{
                                width: '100%',
                                padding: '1.2rem',
                                borderRadius: '16px',
                                border: '1px solid var(--border-color)',
                                background: 'rgba(255, 255, 255, 0.03)',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color 0.3s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                        />

                        <textarea
                            name="message"
                            rows="5"
                            placeholder={t.contact.messagePlaceholder}
                            required
                            style={{
                                width: '100%',
                                padding: '1.2rem',
                                borderRadius: '16px',
                                border: '1px solid var(--border-color)',
                                background: 'rgba(255, 255, 255, 0.03)',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                                outline: 'none',
                                resize: 'vertical',
                                transition: 'border-color 0.3s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                        />

                        <button type="submit" disabled={status === 'sending'} style={{
                            padding: '1.2rem',
                            background: status === 'success' ? '#10b981' : (status === 'error' ? '#ef4444' : 'var(--accent-gradient)'),
                            color: 'white',
                            borderRadius: '16px',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            transition: 'all 0.3s',
                            boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)',
                            cursor: status === 'sending' ? 'wait' : 'pointer',
                            opacity: status === 'sending' ? 0.7 : 1
                        }}
                            onMouseOver={(e) => status === 'idle' && (e.target.style.transform = 'translateY(-2px)')}
                            onMouseOut={(e) => status === 'idle' && (e.target.style.transform = 'translateY(0)')}
                        >
                            {status === 'sending' ? '...' : (status === 'success' ? '✔' : (status === 'error' ? '❌' : t.contact.send))}
                        </button>

                        {status === 'success' && <p style={{ color: '#10b981', textAlign: 'center', fontWeight: '600' }}>Mesajınız başarıyla gönderildi!</p>}
                        {status === 'error' && <p style={{ color: '#ef4444', textAlign: 'center', fontWeight: '600' }}>Bir hata oluştu. Lütfen tekrar deneyin.</p>}

                    </form>
                </div>
            </div>
            <style>{`
        @media (max-width: 768px) {
          form > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </section>
    );
}
