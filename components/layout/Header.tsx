'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useWallet } from '@/hooks/useWallet';
import { WalletButton } from './WalletButton';

const NAV = [
  { href: '/explore', label: 'Explore' },
  { href: '/dashboard', label: 'Dashboard' },
];

export function Header() {
  const pathname = usePathname();
  const { address } = useWallet();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled ? 'glass border-b border-border' : 'bg-transparent'
      )}
    >
      <div className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-sm font-black text-background">
            C
          </span>
          <span className="text-lg font-bold tracking-tight">CREDCHAIN</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname?.startsWith(item.href)
                  ? 'text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {item.label}
            </Link>
          ))}
          {address && (
            <Link
              href={`/profile/${address}`}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname?.startsWith('/profile')
                  ? 'text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              My Profile
            </Link>
          )}
        </nav>

        <WalletButton />
      </div>
    </header>
  );
}
