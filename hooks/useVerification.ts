'use client';

import { useCallback, useState } from 'react';

interface VerificationState {
  arkivVerified: boolean | null;
  chainVerified: boolean | null;
  owner: string | null;
  timestamp: number | null;
  blockNumber: number | null;
  loading: boolean;
}

export function useVerification() {
  const [state, setState] = useState<VerificationState>({
    arkivVerified: null,
    chainVerified: null,
    owner: null,
    timestamp: null,
    blockNumber: null,
    loading: false,
  });

  const runVerification = useCallback(async (credentialId: string) => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await fetch(`/api/credentials/get?id=${credentialId}`);
      // Verify endpoint returns proof — done on the verify page directly.
      const json = await res.json().catch(() => ({}));
      setState((s) => ({ ...s, loading: false, ...json }));
      return json;
    } catch {
      setState((s) => ({ ...s, loading: false }));
      return null;
    }
  }, []);

  return { ...state, runVerification };
}
