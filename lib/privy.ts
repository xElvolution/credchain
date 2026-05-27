import { PrivyClient } from '@privy-io/server-auth';

const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';
const appSecret = process.env.PRIVY_APP_SECRET || '';

let cached: PrivyClient | null = null;

export function getPrivy(): PrivyClient | null {
  if (!appId || !appSecret) return null;
  if (!cached) cached = new PrivyClient(appId, appSecret);
  return cached;
}

export async function verifyPrivyToken(token: string): Promise<{ userId: string; address: string | null } | null> {
  const client = getPrivy();
  if (!client) return null;
  try {
    const claims = await client.verifyAuthToken(token);
    const user = await client.getUser(claims.userId);
    const walletAccount = user.linkedAccounts.find((a) => a.type === 'wallet');
    const address = walletAccount && 'address' in walletAccount ? (walletAccount as any).address.toLowerCase() : null;
    return { userId: claims.userId, address };
  } catch (err) {
    console.error('[privy] verifyAuthToken', err);
    return null;
  }
}
