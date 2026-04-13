'use client';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { pb } = useAuth();
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { email, emailVisibility: true, password, passwordConfirm: password, name, role: 'user' };
      await pb.collection('users').create(data);
      await pb.collection('users').authWithPassword(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError('Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-height))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass animate-fade" style={{ padding: '3.5rem 3rem', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 480 }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2.5rem', textAlign: 'center', letterSpacing: '-1px' }}>Kayıt Ol</h1>
        {error && <div style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center', fontSize: '0.95rem' }}>{error}</div>}
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label className="form-label">Ad Soyad</label>
            <div style={{ position: 'relative' }}>
               <FiUser style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
               <input required value={name} onChange={e => setName(e.target.value)} className="form-input" style={{ paddingLeft: '3rem' }} placeholder="Yunus Emre" />
            </div>
          </div>
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
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', height: '56px' }}>{loading ? 'Yükleniyor...' : 'Hesap Oluştur'}</button>
        </form>
        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '1rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Zaten bir hesabınız var mı? </span>
          <Link href="/login" style={{ color: 'var(--accent-blue)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>Giriş Yap <FiArrowRight /></Link>
        </div>
      </div>
    </div>
  );
}
