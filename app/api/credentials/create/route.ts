import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ensureProfileEntity, storeCredentialEntity } from '@/lib/arkiv';
import { readSession } from '@/lib/session';
import { CREDENTIAL_TYPES } from '@/types';
import { flattenZodError } from '@/lib/zod-utils';

const Body = z.object({
  type: z.enum(['WORK', 'PROJECT', 'SKILL', 'EDUCATION', 'HACKATHON', 'CERTIFICATION', 'CONTRIBUTION']),
  title: z.string().min(1).max(200),
  organization: z.string().min(1).max(200),
  description: z.string().max(4000).optional(),
  startDate: z.iso.datetime().optional().or(z.string().length(0).optional()),
  endDate: z.iso.datetime().optional().or(z.string().length(0).optional()),
  url: z.url().optional().or(z.string().length(0).optional()),
  tags: z.array(z.string().min(1).max(40)).max(20).default([]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await readSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: flattenZodError(parsed.error) }, { status: 400 });
    }
    const input = parsed.data;
    if (!CREDENTIAL_TYPES.includes(input.type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    let user = await prisma.user.upsert({
      where: { address: session.address },
      update: {},
      create: { address: session.address },
    });

    let profileEntityKey = user.arkivProfileKey;
    if (!profileEntityKey) {
      const profileResult = await ensureProfileEntity(session.address, {
        address: session.address,
        username: user.username,
        bio: user.bio,
        avatar: user.avatar,
        website: user.website,
        twitter: user.twitter,
        github: user.github,
      });
      profileEntityKey = profileResult.entityKey;
      user = await prisma.user.update({
        where: { id: user.id },
        data: { arkivProfileKey: profileEntityKey },
      });
    }

    const draft = await prisma.credential.create({
      data: {
        userId: user.id,
        type: input.type,
        title: input.title,
        organization: input.organization,
        description: input.description || null,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        url: input.url || null,
        tags: input.tags,
      },
    });

    const arkivResult = await storeCredentialEntity(
      {
        ...draft,
        type: draft.type as any,
        startDate: draft.startDate?.toISOString() ?? null,
        endDate: draft.endDate?.toISOString() ?? null,
        createdAt: draft.createdAt.toISOString(),
      } as any,
      profileEntityKey,
      session.address
    );

    const updated = await prisma.credential.update({
      where: { id: draft.id },
      data: {
        arkivEntityKey: arkivResult.entityKey,
        txHash: arkivResult.txHash,
      },
    });

    const existingIndex = await prisma.searchIndex.findUnique({ where: { address: session.address } });
    const newSkills = Array.from(new Set([...(existingIndex?.skills ?? []), ...input.tags]));
    const newRoles =
      input.type === 'WORK' || input.type === 'PROJECT'
        ? Array.from(new Set([...(existingIndex?.roles ?? []), input.title]))
        : existingIndex?.roles ?? [];
    const newOrgs = Array.from(new Set([...(existingIndex?.organizations ?? []), input.organization]));

    await prisma.searchIndex.upsert({
      where: { address: session.address },
      update: { skills: newSkills, roles: newRoles, organizations: newOrgs },
      create: {
        address: session.address,
        skills: newSkills,
        roles: newRoles,
        organizations: newOrgs,
      },
    });

    return NextResponse.json({ credential: updated });
  } catch (err) {
    console.error('[credentials/create]', err);
    return NextResponse.json({ error: 'Failed to create credential' }, { status: 500 });
  }
}
