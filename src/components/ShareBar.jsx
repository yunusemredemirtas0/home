'use client';
import { useState, useEffect } from 'react';
import { FiLinkedin, FiTwitter, FiLink, FiCheck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function ShareBar({ title, url, isStatic = false }) {
  const [isCopied, setIsCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : url;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const platforms = [
    {
      name: 'WhatsApp',
      icon: <FaWhatsapp />,
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: '#25D366'
    },
    {
      name: 'LinkedIn',
      icon: <FiLinkedin />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: '#0077b5'
    },
    {
      name: 'Twitter',
      icon: <FiTwitter />,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: '#1DA1F2'
    }
  ];

  const containerClass = isStatic ? 'share-bar-static' : 'share-bar-desktop';

  return (
    <>
      <div className={`${containerClass} ${isVisible ? 'visible' : ''}`}>
        <div style={{ display: 'flex', flexDirection: isStatic ? 'row' : 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.4, writingMode: isStatic ? 'horizontal-tb' : 'vertical-lr', marginBottom: isStatic ? 0 : '1rem', marginRight: isStatic ? '1rem' : 0 }}>
            SHARE
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {platforms.map((p) => (
              <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className="share-btn glass" style={{ '--hover-color': p.color }} title={p.name}>
                {p.icon}
              </a>
            ))}
            <button onClick={copyToClipboard} className="share-btn glass" title="Copy Link" style={{ '--hover-color': 'var(--accent)' }}>
              {isCopied ? <FiCheck style={{ color: '#10b981' }} /> : <FiLink />}
            </button>
          </div>
        </div>
      </div>

      {isCopied && (
        <div className="toast animate-fade" style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000, background: 'rgba(16, 185, 129, 0.9)', color: '#fff', padding: '1rem 2rem', borderRadius: '12px', fontWeight: 700, boxShadow: '0 20px 40px rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FiCheck size={20} /> Link Kopyalandı!
          </div>
        </div>
      )}

      <style jsx>{`
        .share-bar-desktop {
          position: fixed;
          left: 2rem;
          top: 50%;
          transform: translateY(-50%) translateX(-100px);
          z-index: 90;
          transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          opacity: 0;
        }
        .share-bar-desktop.visible {
          transform: translateY(-50%) translateX(0);
          opacity: 1;
        }
        .share-bar-static {
          margin: 4rem 0;
          opacity: 0;
          transition: opacity 0.6s ease;
        }
        .share-bar-static.visible {
          opacity: 1;
        }
        .share-btn {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          font-size: 1.25rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          border: 1px solid var(--glass-border);
        }
        .share-btn:hover {
          background: var(--hover-color);
          color: #fff;
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
          border-color: rgba(255,255,255,0.3);
        }
        @media (max-width: 1200px) {
          .share-bar-desktop {
            position: relative;
            transform: none !important;
            opacity: 1;
            left: 0;
            top: 0;
            margin: 4rem 0;
          }
          .share-bar-desktop > div {
            flex-direction: row !important;
          }
          .share-bar-desktop div div {
            writing-mode: horizontal-tb !important;
            margin-bottom: 0 !important;
            margin-right: 1rem;
          }
        }
      `}</style>
    </>
  );
}
