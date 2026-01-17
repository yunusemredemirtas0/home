import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { auth } from '../firebase';
import { setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';

export default function Login() {
    const { t } = useLanguage();
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Translations for Login
    const loginText = {
        tr: { title: 'Giriş Yap', email: 'E-posta', pass: 'Şifre', btn: 'Giriş Yap', google: 'Google ile Giriş Yap', noAccount: 'Hesabınız yok mu?', regi: 'Kayıt Ol', back: 'Ana Sayfaya Dön', loading: 'Giriş Yapılıyor...', remember: 'Beni Hatırla', or: 'veya' },
        en: { title: 'Login', email: 'Email', pass: 'Password', btn: 'Login', google: 'Sign in with Google', noAccount: "Don't have an account?", regi: 'Register', back: 'Back to Home', loading: 'Logging in...', remember: 'Remember Me', or: 'or' }
    };
    const txt = useLanguage().language === 'tr' ? loginText.tr : loginText.en;

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            // Set persistence based on checkbox
            await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
            await login(email, password);
            navigate('/dashboard'); // Changed from '/' to '/dashboard'
        } catch (err) {
            console.error(err);
            setError('Failed to login. ' + err.message);
        }
        setLoading(false);
    }

    async function handleGoogleLogin() {
        try {
            setError('');
            setLoading(true);
            await loginWithGoogle();
            navigate('/dashboard'); // Changed from '/' to '/dashboard'
        } catch (err) {
            console.error(err);
            alert('Google Sign-In Error: ' + err.message); // Explicit alert for debugging
            setError('Google login failed. ' + err.message);
        }
        setLoading(false);
    }

    return (
        <section style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Glow */}
            <div style={{
                position: 'absolute',
                top: '30%',
                left: '50%',
                transform: 'translate(-50%, -30%)',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 70%)',
                zIndex: -1
            }}></div>

            <div className="glass" style={{
                padding: '3rem',
                borderRadius: '30px',
                width: '100%',
                maxWidth: '400px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                {/* Logo Placeholder */}
                <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: 'var(--accent-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.5rem',
                    marginBottom: '2rem'
                }}>YD</div>

                <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '2rem', textAlign: 'center' }}>{txt.title}</h2>

                {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.8rem',
                        cursor: loading ? 'wait' : 'pointer',
                        marginBottom: '1.5rem',
                        transition: 'background 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                    onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
                >
                    <FcGoogle size={24} />
                    {txt.google}
                </button>

                <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{txt.or}</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                </div>

                <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{txt.email}</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '1px solid var(--border-color)',
                                background: 'rgba(255, 255, 255, 0.03)',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{txt.pass}</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    paddingRight: '3rem', // space for icon
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-color)',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    {/* Remember Me Checkbox */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            style={{
                                width: '16px',
                                height: '16px',
                                accentColor: 'var(--accent-color)',
                                cursor: 'pointer'
                            }}
                        />
                        <label htmlFor="rememberMe" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                            {txt.remember}
                        </label>
                    </div>

                    <button type="submit" disabled={loading} style={{
                        marginTop: '0.5rem',
                        padding: '1rem',
                        background: 'var(--accent-gradient)',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '700',
                        cursor: loading ? 'wait' : 'pointer',
                        border: 'none',
                        boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)',
                        opacity: loading ? 0.7 : 1
                    }}>
                        {loading ? txt.loading : txt.btn}
                    </button>
                </form>

                <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {txt.noAccount} <Link to="/register" style={{ color: 'var(--accent-color)', fontWeight: '600' }}>{txt.regi}</Link>
                </p>

                <Link to="/" style={{
                    marginTop: '1rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    opacity: 0.7
                }}>
                    &larr; {txt.back}
                </Link>
            </div>
        </section>
    );
}
