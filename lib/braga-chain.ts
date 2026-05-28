/** Arkiv Braga testnet - single chain for CREDCHAIN data + auth wallets. */
export { braga } from '@arkiv-network/sdk/chains';

export const BRAGA_RPC =
  process.env.NEXT_PUBLIC_ARKIV_RPC_URL || 'https://braga.hoodi.arkiv.network/rpc';

export const BRAGA_EXPLORER_BASE =
  process.env.NEXT_PUBLIC_ARKIV_EXPLORER?.replace(/\/entity\/?$/, '') ||
  'https://explorer.braga.hoodi.arkiv.network';
