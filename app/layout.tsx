import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'CREDCHAIN - Your credentials. On-chain. Forever.',
  description:
    'The professional credential database owned by builders, not platforms. Store your work history on Arkiv Braga. Share it forever.',
  keywords: ['credentials', 'on-chain', 'Arkiv', 'Braga', 'web3', 'reputation', 'verifiable'],
  openGraph: {
    title: 'CREDCHAIN - Your credentials. On-chain. Forever.',
    description: 'The professional credential database owned by builders, not platforms.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CREDCHAIN',
    description: 'Your credentials. On-chain. Forever.',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0F',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
