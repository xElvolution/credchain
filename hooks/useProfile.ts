'use client';

import { useCallback, useEffect, useState } from 'react';
import type { UserProfile } from '@/types';
import { reputationScore } from '@/lib/utils';
import toast from 'react-hot-toast';

export function useProfile(address?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (addr: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/profile?address=${addr}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setProfile(json.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (address) fetchProfile(address);
  }, [address, fetchProfile]);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      const errMsg = typeof json.error === 'string' ? json.error : 'Update failed';
      toast.error(errMsg);
      throw new Error('Update failed');
    }
    setProfile((prev) => (prev ? { ...prev, ...json.user } : json.user));
    toast.success('Profile updated');
    return json.user;
  }, []);

  return { profile, loading, error, fetchProfile, updateProfile, reputationScore };
}
