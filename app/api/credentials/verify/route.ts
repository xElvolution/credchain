import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { storeVerificationEntity } from '@/lib/arkiv';
import { readSession } from '@/lib/session';

const Body = z.object({
  credentialId: z.string().min(1),
  message: z.string().max(500).optional(),
  txHash: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = readSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const credential = await prisma.credential.findUnique({
      where: { id: parsed.data.credentialId },
      include: { user: true },
    });
    if (!credential) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (credential.user.address.toLowerCase() === session.address.toLowerCase()) {
      return NextResponse.json({ error: 'Cannot verify your own credential' }, { status: 400 });
    }

    if (!credential.arkivEntityKey) {
      return NextResponse.json({ error: 'Credential not stored on Arkiv yet' }, { status: 400 });
    }

    const profileEntityKey = credential.user.arkivProfileKey;
    if (!profileEntityKey) {
      return NextResponse.json({ error: 'Owner profile not on Arkiv' }, { status: 400 });
    }

    const verifier = await prisma.user.upsert({
      where: { address: session.address },
      update: {},
      create: { address: session.address },
    });

    const existing = await prisma.verification.findFirst({
      where: { credentialId: credential.id, verifierId: verifier.id },
    });
    if (existing) {
      return NextResponse.json({ error: 'Already verified' }, { status: 409 });
    }

    const arkivResult = await storeVerificationEntity({
      credentialEntityKey: credential.arkivEntityKey,
      profileEntityKey,
      credentialId: credential.id,
      verifierAddress: session.address,
      ownerAddress: credential.user.address,
      message: parsed.data.message ?? null,
    });

    const verification = await prisma.verification.create({
      data: {
        credentialId: credential.id,
        verifierId: verifier.id,
        message: parsed.data.message ?? null,
        txHash: parsed.data.txHash ?? arkivResult.txHash,
        arkivEntityKey: arkivResult.entityKey,
      },
    });

    await prisma.credential.update({
      where: { id: credential.id },
      data: { verified: true, verifiedBy: session.address },
    });

    return NextResponse.json({ verification });
  } catch (err) {
    console.error('[credentials/verify]', err);
    return NextResponse.json({ error: 'Failed to verify' }, { status: 500 });
  }
}
