'use client';

import { usePrivy } from '@privy-io/react-auth';
import { LogOut, Wallet } from 'lucide-react';
import { truncateAddress } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function WalletButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !ready) {
    return <div className="h-10 w-32 animate-pulse rounded-lg bg-card" aria-hidden />;
  }

  if (!authenticated) {
    return (
      <button
        onClick={login}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_0_24px_-8px_rgba(124,58,237,0.55)] transition-all duration-200 hover:bg-primary-hover"
      >
        <Wallet size={16} />
        Sign in
      </button>
    );
  }

  const address =
    user?.wallet?.address ||
    user?.linkedAccounts?.find((a) => a.type === 'wallet')?.address ||
    '';

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={logout}
        className="mono inline-flex h-10 items-center gap-2 rounded-lg border border-border-bright bg-card px-4 text-sm font-medium text-text-primary transition-colors hover:border-primary"
        title="Sign out"
      >
        <span className="h-2 w-2 rounded-full bg-secondary" />
        {address ? truncateAddress(address) : user?.email?.address || 'Signed in'}
        <LogOut size={13} className="text-muted" />
      </button>
    </div>
  );
}
