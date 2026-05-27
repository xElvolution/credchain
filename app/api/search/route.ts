import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { reputationScore } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const skill = url.searchParams.get('skill')?.toLowerCase();
    const role = url.searchParams.get('role')?.toLowerCase();
    const org = url.searchParams.get('org')?.toLowerCase();
    const q = url.searchParams.get('q')?.toLowerCase();
    const verifiedOnly = url.searchParams.get('verified') === 'true';
    const sort = url.searchParams.get('sort') || 'reputation';

    const indices = await prisma.searchIndex.findMany();

    const matches = indices.filter((idx) => {
      const hay = [
        ...idx.skills.map((s) => s.toLowerCase()),
        ...idx.roles.map((s) => s.toLowerCase()),
        ...idx.organizations.map((s) => s.toLowerCase()),
      ].join(' ');
      if (skill && !idx.skills.some((s) => s.toLowerCase().includes(skill))) return false;
      if (role && !idx.roles.some((s) => s.toLowerCase().includes(role))) return false;
      if (org && !idx.organizations.some((s) => s.toLowerCase().includes(org))) return false;
      if (q && !hay.includes(q)) return false;
      return true;
    });

    const users = await prisma.user.findMany({
      where: { address: { in: matches.map((m) => m.address) } },
      include: {
        credentials: { include: { verifications: true } },
      },
    });

    const enriched = users
      .map((u) => {
        const credCount = u.credentials.length;
        const verifCount = u.credentials.reduce((s, c) => s + c.verifications.length, 0);
        const score = reputationScore(u.credentials as any);
        if (verifiedOnly && verifCount === 0) return null;
        const skills = Array.from(
          new Set(u.credentials.flatMap((c) => c.tags))
        ).slice(0, 6);
        return {
          user: {
            id: u.id,
            address: u.address,
            username: u.username,
            bio: u.bio,
            avatar: u.avatar,
          },
          credentialCount: credCount,
          verificationCount: verifCount,
          reputationScore: score,
          topSkills: skills,
          recentCredentials: u.credentials.slice(0, 3),
        };
      })
      .filter(Boolean) as any[];

    const sorted = [...enriched].sort((a, b) => {
      if (sort === 'credentials') return b.credentialCount - a.credentialCount;
      if (sort === 'verifications') return b.verificationCount - a.verificationCount;
      if (sort === 'newest') return 0;
      return b.reputationScore - a.reputationScore;
    });

    return NextResponse.json({ results: sorted });
  } catch (err) {
    console.error('[search]', err);
    return NextResponse.json({ error: 'Search failed', results: [] }, { status: 500 });
  }
}
