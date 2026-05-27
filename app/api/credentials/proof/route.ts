import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyEntity } from '@/lib/arkiv';

export async function GET(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const credential = await prisma.credential.findUnique({
      where: { id },
      include: {
        user: true,
        verifications: { include: { verifier: true } },
      },
    });
    if (!credential) return NextResponse.json({ credential: null }, { status: 404 });

    let arkivProof = {
      arkivVerified: false,
      arkivOwner: null as string | null,
      arkivCreator: null as string | null,
      arkivExpiresAt: null as number | null,
    };

    if (credential.arkivEntityKey) {
      const proof = await verifyEntity(credential.arkivEntityKey);
      arkivProof = {
        arkivVerified: proof.exists,
        arkivOwner: proof.owner,
        arkivCreator: proof.creator,
        arkivExpiresAt: proof.expiresAt,
      };
    }

    return NextResponse.json({
      credential: {
        ...credential,
        ownerAddress: credential.user.address,
        profileEntityKey: credential.user.arkivProfileKey,
      },
      proof: {
        network: 'braga',
        ...arkivProof,
      },
    });
  } catch (err) {
    console.error('[credentials/proof]', err);
    return NextResponse.json({ error: 'Failed to load proof' }, { status: 500 });
  }
}
