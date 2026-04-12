'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { auth, db } = useAuth();
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!auth || !db) {
      alert("Sistem henüz yükleniyor, lütfen birkaç saniye bekleyin.");
      return;
    }

    setLoading(true);
    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      const { doc, setDoc } = await import('firebase/firestore');

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: name });
      
      const userRole = email === 'yunusemredemirtas.dev@gmail.com' ? 'admin' : 'user';
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        role: userRole,
        createdAt: new Date().toISOString()
      });

      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Kayıt başarısız. Bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-height))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass animate-fade" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 450 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center' }}>Kayıt Ol</h1>
        {error && <div style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="form-label">Ad Soyad</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="form-input" />
          </div>
          <div>
            <label className="form-label">E-posta</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input" />
          </div>
          <div>
            <label className="form-label">Şifre</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-input" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '0.5rem' }}>
            {loading ? 'Hesap Oluşturuluyor...' : 'Hesap Oluştur'}
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.95rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Zaten bir hesabınız var mı? </span>
          <Link href="/login" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
}
