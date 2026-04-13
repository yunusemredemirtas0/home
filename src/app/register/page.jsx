export const runtime = 'edge';
import Register from '../../components/Register';

export const metadata = {
  title: 'Kayıt Ol | Yunus Emre DEMİRTAŞ',
  description: 'Müşteri paneline kayıt olun.',
};

export default function RegisterPage() {
  return <Register />;
}
