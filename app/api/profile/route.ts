import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ensureProfileEntity, updateProfileEntity } from '@/lib/arkiv';
import { readSession } from '@/lib/session';
import { reputationScore } from '@/lib/utils';
import { flattenZodError } from '@/lib/zod-utils';

const PatchBody = z.object({
  username: z.string().min(2).max(40).regex(/^[a-zA-Z0-9_-]+$/).optional().or(z.literal('')).or(z.null()),
  bio: z.string().max(280).optional().or(z.literal('')).or(z.null()),
  website: z.url().optional().or(z.literal('')).or(z.null()),
  twitter: z.string().max(40).optional().or(z.literal('')).or(z.null()),
  github: z.string().max(40).optional().or(z.literal('')).or(z.null()),
  avatar: z.string().max(500).optional().or(z.literal('')).or(z.null()),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const addressParam = url.searchParams.get('address');
    const usernameParam = url.searchParams.get('username');

    let user = null;
    if (addressParam) {
      user = await prisma.user.findUnique({
        where: { address: addressParam.toLowerCase() },
        include: {
          credentials: {
            orderBy: { createdAt: 'desc' },
            include: { verifications: { include: { verifier: true } } },
          },
          verifications: { include: { credential: true, verifier: true } },
        },
      });
    } else if (usernameParam) {
      user = await prisma.user.findUnique({
        where: { username: usernameParam },
        include: {
          credentials: {
            orderBy: { createdAt: 'desc' },
            include: { verifications: { include: { verifier: true } } },
          },
          verifications: { include: { credential: true, verifier: true } },
        },
      });
    } else {
      return NextResponse.json({ error: 'address or username required' }, { status: 400 });
    }

    if (!user) return NextResponse.json({ user: null });

    const score = reputationScore(user.credentials as any);
    return NextResponse.json({ user: { ...user, reputationScore: score } });
  } catch (err) {
    console.error('[profile/GET]', err);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await readSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const parsed = PatchBody.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: flattenZodError(parsed.error) }, { status: 400 });
    }

    const cleaned: Record<string, string | null> = {};
    for (const [k, v] of Object.entries(parsed.data)) {
      if (v === '' || v === undefined) continue;
      cleaned[k] = v as string | null;
    }

    const user = await prisma.user.upsert({
      where: { address: session.address },
      update: cleaned,
      create: { address: session.address, ...cleaned },
    });

    const profilePayload = {
      address: session.address,
      username: user.username,
      bio: user.bio,
      avatar: user.avatar,
      website: user.website,
      twitter: user.twitter,
      github: user.github,
    };

    let updatedUser = user;

    if (user.arkivProfileKey) {
      await updateProfileEntity(user.arkivProfileKey, session.address, profilePayload);
    } else {
      const { entityKey } = await ensureProfileEntity(session.address, profilePayload);
      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { arkivProfileKey: entityKey },
      });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'Username taken' }, { status: 409 });
    }
    console.error('[profile/PATCH]', err);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
