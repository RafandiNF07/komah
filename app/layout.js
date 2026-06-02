import { DM_Sans, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

// Inisialisasi Google Fonts secara Lokal (Self-Hosted secara otomatis saat build)
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['500', '700'],
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-headline',
  weight: ['600', '700'],
  display: 'swap',
});

export const metadata = {
  title: 'KOMAH - Ojek Kampus Hemat & Aman',
  description: 'Ojek Kampus Hemat & Aman untuk Mahasiswa UIN SUSKA',
  applicationName: 'KOMAH',
  keywords: ['KOMAH', 'ojek kampus', 'ride hailing mahasiswa', 'UIN SUSKA'],
  themeColor: '#000000',
  icons: {
    icon: '/icons/logo.png',
    shortcut: '/icons/logo.png',
    apple: '/icons/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`scroll-smooth dark ${dmSans.variable} ${jetbrainsMono.variable} ${plusJakartaSans.variable}`}>
      <body className="antialiased bg-[#0A0A0A] text-text-primary min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
