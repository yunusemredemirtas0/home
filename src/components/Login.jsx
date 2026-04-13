'use client';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    <div style={{ minHeight: 'calc(100vh - var(--nav-height))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass animate-fade" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 450 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center' }}>Giriş Yap</h1>
        {error && <div style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div><label className="form-label">E-posta</label><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input" /></div>
          <div><label className="form-label">Şifre</label><input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-input" /></div>
          <button type="submit" disabled={loading} className="btn-primary">{loading ? '...' : 'Giriş Yap'}</button>
        </form>
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.95rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Hesabınız yok mu? </span>
          <Link href="/register" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
}
