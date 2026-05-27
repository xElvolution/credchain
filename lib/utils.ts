import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

export function truncateHash(hash: string, head: number = 8, tail: number = 6): string {
  if (!hash) return '';
  if (hash.length <= head + tail) return hash;
  return `${hash.slice(0, head)}…${hash.slice(-tail)}`;
}

export function formatDate(date: string | Date | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

export function formatDateRange(start: string | Date | null, end: string | Date | null): string {
  if (!start) return '';
  const s = formatDate(start);
  const e = end ? formatDate(end) : 'Present';
  return `${s} - ${e}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

const AVATAR_PALETTE = [
  ['#4F46E5', '#00FF87'],
  ['#7C3AED', '#3B82F6'],
  ['#EC4899', '#F97316'],
  ['#10B981', '#06B6D4'],
  ['#F43F5E', '#8B5CF6'],
  ['#FBBF24', '#EF4444'],
];

export function gradientFromAddress(address: string): string {
  if (!address) return `linear-gradient(135deg, #4F46E5, #00FF87)`;
  const seed = parseInt(address.slice(2, 10), 16);
  const [a, b] = AVATAR_PALETTE[seed % AVATAR_PALETTE.length];
  const angle = (seed % 360);
  return `linear-gradient(${angle}deg, ${a}, ${b})`;
}

export function reputationScore(credentials: { verified?: boolean; type: string; verifications?: unknown[] }[]): number {
  const base = credentials.length * 10;
  const verifs = credentials.reduce((s, c) => s + (c.verifications?.length ?? 0), 0);
  const verifiedBonus = credentials.filter((c) => c.verified).length * 15;
  const uniqueTypes = new Set(credentials.map((c) => c.type)).size;
  const diversity = uniqueTypes * 20;
  return Math.min(1000, base + verifs * 25 + verifiedBonus + diversity);
}

export function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  return Promise.reject(new Error('Clipboard unavailable'));
}

export function arkivExplorerUrl(entityKey: string): string {
  const base =
    process.env.NEXT_PUBLIC_ARKIV_EXPLORER ||
    'https://explorer.braga.hoodi.arkiv.network/entity/';
  return `${base}${encodeURIComponent(entityKey)}`;
}

export function bragaTxUrl(txHash: string): string {
  const base =
    process.env.NEXT_PUBLIC_BRAGA_TX_EXPLORER ||
    'https://explorer.braga.hoodi.arkiv.network/tx/';
  return `${base}${encodeURIComponent(txHash)}`;
}

export function bragaAddressUrl(address: string): string {
  const base =
    process.env.NEXT_PUBLIC_BRAGA_ADDRESS_EXPLORER ||
    'https://explorer.braga.hoodi.arkiv.network/address/';
  return `${base}${encodeURIComponent(address)}`;
}

export function isAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let t: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
