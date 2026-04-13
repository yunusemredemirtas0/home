import Logo from '../components/Logo';

export default function page() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>
      <div style={{ textAlign: 'center' }}>
        <Logo />
        <h1 style={{ marginTop: '2rem' }}>404 - Sayfa Bulunamadı</h1>
        <p>Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
        <a href="/" className="btn-primary" style={{ marginTop: '2rem' }}>Ana Sayfaya Dön</a>
      </div>
    </div>
  );
}
