'use client';

import { createConfig } from '@privy-io/wagmi';
import { http } from 'wagmi';
import { braga, BRAGA_RPC } from '@/lib/braga-chain';

export const wagmiConfig = createConfig({
  chains: [braga],
  transports: {
    [braga.id]: http(BRAGA_RPC),
  },
});
