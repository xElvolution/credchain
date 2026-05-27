import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.NEXTAUTH_SECRET || 'credchain-dev-secret-change-me';
const COOKIE_NAME = 'credchain.session';

function sign(value: string): string {
  return createHmac('sha256', SECRET).update(value).digest('hex');
}

function pack(payload: Record<string, unknown>): string {
  const json = JSON.stringify(payload);
  const body = Buffer.from(json, 'utf8').toString('base64url');
  return `${body}.${sign(body)}`;
}

function unpack<T>(token: string): T | null {
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = sign(body);
  try {
    if (
      sig.length !== expected.length ||
      !timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))
    ) {
      return null;
    }
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as T;
  } catch {
    return null;
  }
}

export interface Session {
  address: string;
  issuedAt: number;
  expiresAt: number;
}

export function createSession(address: string): string {
  const now = Date.now();
  const session: Session = {
    address: address.toLowerCase(),
    issuedAt: now,
    expiresAt: now + 1000 * 60 * 60 * 24 * 7,
  };
  return pack(session as unknown as Record<string, unknown>);
}

export async function readSession(): Promise<Session | null> {
  const store = await cookies();
  const c = store.get(COOKIE_NAME);
  if (!c) return null;
  const session = unpack<Session>(c.value);
  if (!session) return null;
  if (session.expiresAt < Date.now()) return null;
  return session;
}

export const SESSION_COOKIE = COOKIE_NAME;
