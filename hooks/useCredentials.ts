'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Credential } from '@/types';
import toast from 'react-hot-toast';

export function useCredentials(address?: string) {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCredentials = useCallback(async (addr: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/credentials/get?address=${addr}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setCredentials(json.credentials ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (address) fetchCredentials(address);
  }, [address, fetchCredentials]);

  const addCredential = useCallback((c: Credential) => {
    setCredentials((prev) => [c, ...prev]);
  }, []);

  const verifyCredential = useCallback(async (credentialId: string, message?: string) => {
    const res = await fetch('/api/credentials/verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ credentialId, message }),
    });
    const json = await res.json();
    if (!res.ok) {
      const errMsg = typeof json.error === 'string' ? json.error : 'Verification failed';
      toast.error(errMsg);
      throw new Error(errMsg);
    }
    setCredentials((prev) =>
      prev.map((c) => (c.id === credentialId ? { ...c, verified: true } : c))
    );
    toast.success('Credential verified');
    return json.verification;
  }, []);

  return { credentials, loading, error, fetchCredentials, addCredential, verifyCredential };
}
