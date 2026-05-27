'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import toast from 'react-hot-toast';

export function useWallet() {
  const { ready, authenticated, user, login, logout, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  const [synced, setSynced] = useState(false);

  const wallet = wallets[0];
  const address = (wallet?.address || user?.wallet?.address || '').toLowerCase() || undefined;
  const isConnected = authenticated && !!address;

  const syncSession = useCallback(async () => {
    if (!authenticated) return false;
    try {
      const token = await getAccessToken();
      if (!token) return false;
      const res = await fetch('/api/auth/privy', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Session sync failed');
      setSynced(true);
      return true;
    } catch (err) {
      console.error(err);
      toast.error('Could not start session');
      return false;
    }
  }, [authenticated, getAccessToken]);

  useEffect(() => {
    if (authenticated && !synced) {
      syncSession();
    }
  }, [authenticated, synced, syncSession]);

  const signIn = useCallback(async () => {
    if (!authenticated) {
      login();
      return false;
    }
    return syncSession();
  }, [authenticated, login, syncSession]);

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setSynced(false);
    await logout();
  }, [logout]);

  return {
    ready,
    address: address as `0x${string}` | undefined,
    isConnected,
    chainId: 11155111,
    signingIn: false,
    authed: synced,
    signIn,
    logout: handleLogout,
  };
}
