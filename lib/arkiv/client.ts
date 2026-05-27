import { createPublicClient, createWalletClient, http, type PublicClient, type WalletClient } from '@arkiv-network/sdk';
import { privateKeyToAccount } from '@arkiv-network/sdk/accounts';
import { braga } from '@arkiv-network/sdk/chains';
import { BRAGA_RPC } from '@/lib/braga-chain';

let publicClient: PublicClient | null = null;
let walletClient: WalletClient | null = null;
let creatorAddress: string | null = null;

export function hasArkivWallet(): boolean {
  return Boolean(process.env.ARKIV_PRIVATE_KEY);
}

export function getArkivCreatorAddress(): string | null {
  if (creatorAddress) return creatorAddress;
  const key = process.env.ARKIV_PRIVATE_KEY;
  if (!key) return null;
  creatorAddress = privateKeyToAccount(key as `0x${string}`).address.toLowerCase();
  return creatorAddress;
}

export function getArkivPublicClient(): PublicClient {
  if (!publicClient) {
    publicClient = createPublicClient({
      chain: braga,
      transport: http(process.env.ARKIV_RPC_URL || BRAGA_RPC),
    });
  }
  return publicClient;
}

export function getArkivWalletClient(): WalletClient {
  const key = process.env.ARKIV_PRIVATE_KEY;
  if (!key) {
    throw new Error('ARKIV_PRIVATE_KEY is required for write operations on Braga testnet');
  }
  if (!walletClient) {
    const account = privateKeyToAccount(key as `0x${string}`);
    creatorAddress = account.address.toLowerCase();
    walletClient = createWalletClient({
      chain: braga,
      transport: http(process.env.ARKIV_RPC_URL || BRAGA_RPC),
      account,
    });
  }
  return walletClient;
}

export { braga };
