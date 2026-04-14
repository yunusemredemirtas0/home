'use client';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { pb } = useAuth();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await pb.collection('users').authWithPassword(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-height))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
      <div className="glass animate-fade" style={{ padding: 'clamp(2rem, 8vw, 3.5rem) clamp(1.5rem, 6vw, 3rem)', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 480 }}>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 2.5rem)', fontWeight: 900, marginBottom: '2.5rem', textAlign: 'center', letterSpacing: '-1px' }}>Giriş Yap</h1>
        {error && <div style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center', fontSize: '0.95rem', fontWeight: 500 }}>{error}</div>}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label className="form-label">E-posta</label>
            <div style={{ position: 'relative' }}>
               <FiMail style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
               <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input" style={{ paddingLeft: '3rem' }} placeholder="ornek@mail.com" />
            </div>
          </div>
          <div>
            <label className="form-label">Şifre</label>
            <div style={{ position: 'relative' }}>
               <FiLock style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
               <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-input" style={{ paddingLeft: '3rem' }} placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', height: '56px' }}>{loading ? 'Yükleniyor...' : 'Giriş Yap'}</button>
        </form>
        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '1rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Hesabınız yok mu? </span>
          <Link href="/register" style={{ color: 'var(--accent-blue)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>Kayıt Ol <FiArrowRight /></Link>
        </div>
      </div>
    </div>
  );
}
