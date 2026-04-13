export const runtime = 'edge';

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body style={{ background: '#050508', color: '#fff', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
