'use client';

import DashboardLayout from '@/components/DashboardLayout';

const USER_MENU = [
  { href: '/user', label: 'Dashboard', icon: '/icons/dashboard.png' },
  { href: '/user/history', label: 'Riwayat', icon: '/icons/history.png' },
  { href: '/user/profile', label: 'Profil', icon: '/icons/profil.png' }
];

export default function UserDashboardLayout({ children }) {
  return (
    <DashboardLayout 
      menuItems={USER_MENU}
      roleLabel="Pelanggan"
      profilePicKey="userProfilePic"
      profilePicEvent="profilePictureUpdated"
    >
      {children}
    </DashboardLayout>
  );
}