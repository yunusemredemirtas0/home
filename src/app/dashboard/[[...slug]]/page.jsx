export const runtime = 'edge';

import DashboardClient from '../../../components/DashboardClient';

export const metadata = {
  title: 'Müşteri Paneli | Yunus Emre DEMİRTAŞ',
  description: 'Müşteriler için özel yönetim paneli.',
};

export default function DashboardPage() {
  return <DashboardClient />;
}
