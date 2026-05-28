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
    const claims = await client.utils().auth().verifyAccessToken(token);
    const userId = claims.user_id;
    if (!userId) return null;

    const user = await client.users()._get(userId);
    const linked = user?.linked_accounts ?? [];
    const walletAccount = linked.find((a: any) => a?.type === 'wallet');
    const rawAddress: unknown = (walletAccount as any)?.address;
    const address = typeof rawAddress === 'string' ? rawAddress.toLowerCase() : null;

    return { userId, address };
  } catch (err) {
    console.error('[privy] verifyAccessToken', err);
    return null;
  }
}
