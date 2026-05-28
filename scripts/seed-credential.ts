/**
 * One-shot seed: publishes a credential without needing a browser session.
 *
 * Auth bypass: reads ARKIV_PRIVATE_KEY from .env.local, derives the wallet
 * address, and uses that as the owner. Calls the exact same Arkiv service
 * functions that /api/credentials/create uses.
 *
 * Usage:  pnpm tsx scripts/seed-credential.ts
 *
 * Edit CREDENTIAL below to change what gets pushed.
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// --- Load .env.local manually (so we don't need dotenv) -----------------
const envPath = resolve(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

if (!process.env.ARKIV_PRIVATE_KEY) {
  console.error('ARKIV_PRIVATE_KEY missing from .env.local');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL missing from .env.local');
  process.exit(1);
}

// --- The credential to publish ------------------------------------------
const CREDENTIAL = {
  type: 'HACKATHON' as const,
  title: 'Built CREDCHAIN on Arkiv',
  organization: 'Arkiv Web3 Database Builder Challenge',
  description:
    "Web3-native professional credential platform. Profiles, credentials, skills, and verifications are stored as Arkiv entities on Braga testnet. Anyone can browse and verify a builder's history without connecting a wallet.",
  tags: ['Arkiv', 'Braga', 'Next.js', 'Privy', 'TypeScript', 'Web3'],
};

async function run() {
  // Dynamic imports so dotenv-style env loading above runs first.
  const { prisma } = await import('../lib/prisma');
  const { ensureProfileEntity, storeCredentialEntity } = await import('../lib/arkiv');
  const { getArkivCreatorAddress } = await import('../lib/arkiv/client');

  const address = getArkivCreatorAddress();
  if (!address) throw new Error('Could not derive address from ARKIV_PRIVATE_KEY');
  console.log('Owner address:', address);

  // 1. Upsert user
  let user = await prisma.user.upsert({
    where: { address },
    update: {},
    create: { address },
  });
  console.log('User:', user.id);

  // 2. Ensure profile entity on Arkiv
  let profileEntityKey = user.arkivProfileKey;
  if (!profileEntityKey) {
    console.log('Publishing profile entity to Arkiv Braga...');
    const profileResult = await ensureProfileEntity(address, {
      address,
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
    console.log('Profile entity:', profileEntityKey);
    console.log('Profile tx:    ', profileResult.txHash);
  } else {
    console.log('Profile entity already exists:', profileEntityKey);
  }

  // 3. Draft credential in Postgres
  const draft = await prisma.credential.create({
    data: {
      userId: user.id,
      type: CREDENTIAL.type,
      title: CREDENTIAL.title,
      organization: CREDENTIAL.organization,
      description: CREDENTIAL.description || null,
      tags: CREDENTIAL.tags,
    },
  });
  console.log('Draft credential:', draft.id);

  // 4. Publish credential entity to Arkiv Braga
  console.log('Publishing credential entity to Arkiv Braga...');
  const arkivResult = await storeCredentialEntity(
    {
      ...(draft as any),
      type: draft.type as any,
      startDate: draft.startDate?.toISOString() ?? null,
      endDate: draft.endDate?.toISOString() ?? null,
      createdAt: draft.createdAt.toISOString(),
    },
    profileEntityKey,
    address
  );
  console.log('Credential entity:', arkivResult.entityKey);
  console.log('Credential tx:    ', arkivResult.txHash);

  // 5. Save entity key + tx hash back to Postgres
  const updated = await prisma.credential.update({
    where: { id: draft.id },
    data: {
      arkivEntityKey: arkivResult.entityKey,
      txHash: arkivResult.txHash,
    },
  });

  // 6. Update search index
  const existing = await prisma.searchIndex.findUnique({ where: { address } });
  const skills = Array.from(new Set([...(existing?.skills ?? []), ...CREDENTIAL.tags]));
  const orgs = Array.from(new Set([...(existing?.organizations ?? []), CREDENTIAL.organization]));
  const roles = existing?.roles ?? [];
  await prisma.searchIndex.upsert({
    where: { address },
    update: { skills, roles, organizations: orgs },
    create: { address, skills, roles, organizations: orgs },
  });

  console.log('');
  console.log('========================================');
  console.log('SUCCESS');
  console.log('========================================');
  console.log('Credential ID:    ', updated.id);
  console.log('Entity key:       ', updated.arkivEntityKey);
  console.log('Braga tx:         ', updated.txHash);
  console.log('Verify page:      ', `/verify/${updated.id}`);
  console.log('Profile page:     ', `/profile/${address}`);
  console.log(
    'Braga explorer:   ',
    `https://explorer.braga.hoodi.arkiv.network/entity/${updated.arkivEntityKey}`
  );
  console.log(
    'Braga tx explorer:',
    `https://explorer.braga.hoodi.arkiv.network/tx/${updated.txHash}`
  );

  await prisma.$disconnect();
}

run().catch(async (err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
