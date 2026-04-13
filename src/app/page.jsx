export const runtime = 'edge';

export default function Home() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Yunus Emre - Teşhis Modu</h1>
      <p style={{ opacity: 0.7 }}>Eğer bu yazıyı görüyorsanız, Cloudflare ayarlarınız doğru demektir.</p>
      <p style={{ marginTop: '2rem', color: '#7c3aed' }}>Hata tespiti yapılıyor...</p>
    </div>
  );
}
