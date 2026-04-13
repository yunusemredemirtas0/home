export const runtime = 'edge';
import Login from '../../components/Login';

export const metadata = {
  title: 'Giriş Yap | Yunus Emre DEMİRTAŞ',
  description: 'Müşteri paneline giriş yapın.',
};

export default function LoginPage() {
  return <Login />;
}
