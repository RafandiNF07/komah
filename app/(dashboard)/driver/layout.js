'use client';

import DashboardLayout from '@/components/DashboardLayout';

const DRIVER_MENU = [
  { href: '/driver', label: 'Dashboard', icon: '/icons/dashboard.png' },
  { href: '/driver/pesanan', label: 'Pesanan', icon: '/icons/pesanan.png' },
  { href: '/driver/history', label: 'Riwayat', icon: '/icons/history.png' },
  { href: '/driver/pendapatan', label: 'Pendapatan', icon: '/icons/pendapatan.png' },
  { href: '/driver/profile', label: 'Profil', icon: '/icons/profil.png' }
];

export default function DriverDashboardLayout({ children }) {
  return (
    <DashboardLayout 
      menuItems={DRIVER_MENU}
      roleLabel="Driver KOMAH"
      profilePicKey="driverProfilePic"
      profilePicEvent="driverProfilePictureUpdated"
    >
      {children}
    </DashboardLayout>
  );
}