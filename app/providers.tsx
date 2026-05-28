'use client';

import { useState, type ReactNode } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { braga, BRAGA_RPC } from '@/lib/braga-chain';
import { wagmiConfig } from '@/lib/wagmi';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false },
        },
      })
  );

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#7C3AED',
          logo: undefined,
          showWalletLoginFirst: false,
        },
        loginMethods: ['email', 'wallet', 'google', 'github'],
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
        defaultChain: braga,
        supportedChains: [braga],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#16161F',
                color: '#FAFAFA',
                border: '1px solid #ffffff12',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#A78BFA', secondary: '#0A0A0F' } },
              error: { iconTheme: { primary: '#F43F5E', secondary: '#0A0A0F' } },
            }}
          />
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
