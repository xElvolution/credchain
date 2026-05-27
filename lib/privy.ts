import { PrivyClient } from '@privy-io/node';

const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';
const appSecret = process.env.PRIVY_APP_SECRET || '';
const jwtVerificationKey = process.env.PRIVY_JWT_VERIFICATION_KEY || undefined;

let cached: PrivyClient | null = null;

export function getPrivy(): PrivyClient | null {
  if (!appId || !appSecret) return null;
  if (!cached) {
    cached = new PrivyClient({
      appId,
      appSecret,
      ...(jwtVerificationKey ? { jwtVerificationKey } : {}),
    });
  }
  return cached;
}

export async function verifyPrivyToken(
  token: string
): Promise<{ userId: string; address: string | null } | null> {
  const client = getPrivy();
  if (!client) return null;
  try {
    const claims = await client.utils().auth().verifyAccessToken({ access_token: token });
    const userId = claims.userId;
    if (!userId) return null;

    const user = await client.users().get({ user_id: userId });
    const linked = (user as any)?.linked_accounts ?? (user as any)?.linkedAccounts ?? [];
    const walletAccount = linked.find((a: any) => a?.type === 'wallet');
    const rawAddress: unknown = walletAccount?.address;
    const address = typeof rawAddress === 'string' ? rawAddress.toLowerCase() : null;

    return { userId, address };
  } catch (err) {
    console.error('[privy] verifyAccessToken', err);
    return null;
  }
}
