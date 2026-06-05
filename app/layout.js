import './globals.css';

export const metadata = {
  title: 'KOMAH - Ojek Kampus Hemat & Aman',
  description: 'Ojek Kampus Hemat & Aman untuk Mahasiswa UIN SUSKA',
  applicationName: 'KOMAH',
  keywords: ['KOMAH', 'ojek kampus', 'ride hailing mahasiswa', 'UIN SUSKA'],
  themeColor: '#000000',
  icons: {
    icon: '/icons/favicon1.png',
    shortcut: '/icons/favicon1.png',
    apple: '/icons/favicon1.png',
  },
};

// Tambahkan blok ini di bawah blok metadata tadi
export const viewport = {
  themeColor: '#000000',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="scroll-smooth dark">
      <body className="antialiased bg-[#0A0A0A] text-text-primary min-h-screen flex flex-col">
        {/* Children di sini akan merender layout yang ada di dalam (public) atau (auth) */}
        {children}
      </body>
    </html>
  );
}
