import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyEntity } from '@/lib/arkiv';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const address = url.searchParams.get('address')?.toLowerCase();
    if (!address) {
      return NextResponse.json({ error: 'address required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { address },
      include: {
        credentials: {
          orderBy: { createdAt: 'desc' },
          include: { verifications: { include: { verifier: true } } },
        },
      },
    });

    if (!user) return NextResponse.json({ credentials: [] });

    const credentials = await Promise.all(
      user.credentials.map(async (c) => {
        let arkivVerified = false;
        let arkivOwner: string | null = null;
        let arkivCreator: string | null = null;
        if (c.arkivEntityKey) {
          const proof = await verifyEntity(c.arkivEntityKey);
          arkivVerified = proof.exists;
          arkivOwner = proof.owner;
          arkivCreator = proof.creator;
        }
        return { ...c, arkivVerified, arkivOwner, arkivCreator };
      })
    );

    return NextResponse.json({ credentials });
  } catch (err) {
    console.error('[credentials/get]', err);
    return NextResponse.json({ error: 'Failed to load credentials' }, { status: 500 });
  }
}
