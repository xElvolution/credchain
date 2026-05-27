import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPrivyToken } from '@/lib/privy';
import { createSession, SESSION_COOKIE } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

    const verified = await verifyPrivyToken(token);
    if (!verified) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    if (!verified.address) {
      return NextResponse.json({ error: 'No wallet linked to Privy user' }, { status: 400 });
    }

    const address = verified.address.toLowerCase();

    await prisma.user.upsert({
      where: { address },
      update: {},
      create: { address },
    });

    const sessionToken = createSession(address);
    const res = NextResponse.json({ address });
    res.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    console.error('[auth/privy]', err);
    return NextResponse.json({ error: 'Session sync failed' }, { status: 500 });
  }
}
