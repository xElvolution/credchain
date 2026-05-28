import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 60;

export async function GET() {
  try {
    const [credentialsIssued, verifications, builders, indices] = await Promise.all([
      prisma.credential.count(),
      prisma.verification.count(),
      prisma.user.count(),
      prisma.searchIndex.findMany({ select: { organizations: true } }),
    ]);

    const orgSet = new Set<string>();
    for (const idx of indices) {
      for (const org of idx.organizations) {
        if (org && org.trim()) orgSet.add(org.trim().toLowerCase());
      }
    }

    return NextResponse.json({
      credentialsIssued,
      verifications,
      builders,
      organizations: orgSet.size,
    });
  } catch (err) {
    console.error('[stats]', err);
    return NextResponse.json(
      { credentialsIssued: 0, verifications: 0, builders: 0, organizations: 0 },
      { status: 200 }
    );
  }
}
