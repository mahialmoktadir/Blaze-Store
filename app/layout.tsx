import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BLAZE STORE | Premium Digital Subscription & Products Marketplace',
  description: 'Premium Bangladesh Digital Subscription & Products Marketplace created by MaHi Al-Moktadir. Features bKash, Nagad, Rocket mobile payments and instant digital delivery.',
  openGraph: {
    title: 'BLAZE STORE | Premium Digital Marketplace',
    description: 'Buy Netflix, Spotify, YouTube Premium, Discord Nitro, Canva Pro, VPNs, and gaming subscriptions in Bangladesh with instant delivery.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BLAZE STORE | Premium Digital Marketplace',
    description: 'Instant digital subscriptions and license delivery via bKash, Nagad, and Rocket.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Manrope:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0B0D10] text-[#FFFFFF] font-sans antialiased selection:bg-[#FF6A00]/25 selection:text-[#FF6A00]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
