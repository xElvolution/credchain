/**
 * Arkiv entity service - Braga testnet via @arkiv-network/sdk.
 *
 * Entity model (challenge requirements):
 * - payload + contentType + attributes + expiresIn on every entity
 * - PROJECT_ATTRIBUTE on every create and query
 * - $owner / $creator via SDK metadata (withMetadata)
 * - Relationships via shared attribute keys (profileEntityKey, credentialEntityKey)
 *
 * Entity types: profile, credential, credentialSkill, verification
 */

import { jsonToPayload, ExpirationTime } from '@arkiv-network/sdk/utils';
import { eq } from '@arkiv-network/sdk/query';
import type { Credential, UserProfile } from '@/types';
import {
  PROJECT_ATTRIBUTE,
  ENTITY_TYPE,
  DEFAULT_EXPIRY_DAYS,
} from './constants';
import { getArkivPublicClient, getArkivWalletClient, getArkivCreatorAddress, hasArkivWallet } from './client';
import * as local from './local';

export { PROJECT_ATTRIBUTE, ENTITY_TYPE, BRAGA_EXPLORER } from './constants';
export { hasArkivWallet, getArkivCreatorAddress };

export interface ArkivWriteResult {
  entityKey: string;
  txHash: string;
}

export interface ArkivVerifyResult {
  exists: boolean;
  owner: string | null;
  creator: string | null;
  expiresAt: number | null;
}

export interface ArkivEntityProof extends ArkivVerifyResult {
  entityKey: string;
  payload: unknown | null;
  contentType: string | null;
}

class ArkivError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'ArkivError';
  }
}

function expirySeconds(): number {
  const days = Number(process.env.ARKIV_EXPIRY_DAYS || DEFAULT_EXPIRY_DAYS);
  return ExpirationTime.fromDays(days);
}

/** Ensure a profile entity exists on Arkiv; returns entity key. */
export async function ensureProfileEntity(
  ownerAddress: string,
  profile: Pick<UserProfile, 'address' | 'username' | 'bio' | 'avatar' | 'website' | 'twitter' | 'github'>
): Promise<ArkivWriteResult> {
  const owner = ownerAddress.toLowerCase();
  const payload = {
    address: owner,
    username: profile.username,
    bio: profile.bio,
    avatar: profile.avatar,
    website: profile.website,
    twitter: profile.twitter,
    github: profile.github,
    updatedAt: new Date().toISOString(),
  };

  if (!hasArkivWallet()) {
    const result = local.localCreateEntity({
      entityType: ENTITY_TYPE.PROFILE,
      payload,
      contentType: 'application/json',
      attributes: { ownerAddress: owner, profileId: owner },
      ownerAddress: owner,
      creatorAddress: owner,
      expiresInSeconds: expirySeconds(),
      seed: `profile:${owner}`,
    });
    console.log('[arkiv:local] profile entity', result);
    return { entityKey: result.entityKey, txHash: result.txHash };
  }

  try {
    const wallet = getArkivWalletClient();
    const { entityKey, txHash } = await wallet.createEntity({
      payload: jsonToPayload(payload),
      contentType: 'application/json',
      attributes: [
        PROJECT_ATTRIBUTE,
        { key: 'entityType', value: ENTITY_TYPE.PROFILE },
        { key: 'ownerAddress', value: owner },
        { key: 'profileId', value: owner },
      ],
      expiresIn: expirySeconds(),
    });
    console.log('[arkiv] profile entity', { entityKey, txHash, owner });
    return { entityKey, txHash };
  } catch (err) {
    console.error('[arkiv] ensureProfileEntity failed', err);
    throw new ArkivError('Failed to store profile on Arkiv Braga', err);
  }
}

/** Update an existing profile entity (requires entity key + wallet). */
export async function updateProfileEntity(
  entityKey: string,
  ownerAddress: string,
  profile: Pick<UserProfile, 'username' | 'bio' | 'avatar' | 'website' | 'twitter' | 'github'>
): Promise<ArkivWriteResult> {
  const owner = ownerAddress.toLowerCase();
  const payload = {
    address: owner,
    ...profile,
    updatedAt: new Date().toISOString(),
  };

  if (!hasArkivWallet()) {
    const existing = local.localGetEntity(entityKey);
    if (existing) {
      existing.payload = payload;
      return { entityKey, txHash: existing.txHash };
    }
    return ensureProfileEntity(owner, { address: owner, ...profile });
  }

  try {
    const wallet = getArkivWalletClient();
    const { txHash } = await wallet.updateEntity({
      entityKey,
      payload: jsonToPayload(payload),
      contentType: 'application/json',
      attributes: [
        PROJECT_ATTRIBUTE,
        { key: 'entityType', value: ENTITY_TYPE.PROFILE },
        { key: 'ownerAddress', value: owner },
        { key: 'profileId', value: owner },
      ],
      expiresIn: expirySeconds(),
    });
    console.log('[arkiv] profile updated', { entityKey, txHash });
    return { entityKey, txHash };
  } catch (err) {
    console.error('[arkiv] updateProfileEntity failed', err);
    throw new ArkivError('Failed to update profile on Arkiv', err);
  }
}

/** Store credential + skill relationship entities on Arkiv. */
export async function storeCredentialEntity(
  credential: Credential,
  profileEntityKey: string,
  ownerAddress: string
): Promise<ArkivWriteResult> {
  const owner = ownerAddress.toLowerCase();
  const payload = {
    id: credential.id,
    type: credential.type,
    title: credential.title,
    organization: credential.organization,
    description: credential.description,
    startDate: credential.startDate,
    endDate: credential.endDate,
    url: credential.url,
    tags: credential.tags,
    createdAt: credential.createdAt,
  };

  if (!hasArkivWallet()) {
    const result = local.localCreateEntity({
      entityType: ENTITY_TYPE.CREDENTIAL,
      payload,
      contentType: 'application/json',
      attributes: {
        ownerAddress: owner,
        profileEntityKey,
        credentialId: credential.id,
      },
      ownerAddress: owner,
      creatorAddress: getArkivCreatorAddress() || owner,
      expiresInSeconds: expirySeconds(),
      seed: `credential:${credential.id}`,
    });
    for (const tag of credential.tags) {
      local.localCreateEntity({
        entityType: ENTITY_TYPE.CREDENTIAL_SKILL,
        payload: { credentialId: credential.id, skill: tag, profileEntityKey },
        contentType: 'application/json',
        attributes: {
          ownerAddress: owner,
          profileEntityKey,
          credentialEntityKey: result.entityKey,
          skill: tag.toLowerCase(),
        },
        ownerAddress: owner,
        creatorAddress: getArkivCreatorAddress() || owner,
        expiresInSeconds: expirySeconds(),
        seed: `skill:${credential.id}:${tag}`,
      });
    }
    console.log('[arkiv:local] credential entity', result);
    return { entityKey: result.entityKey, txHash: result.txHash };
  }

  try {
    const wallet = getArkivWalletClient();
    const { entityKey, txHash } = await wallet.createEntity({
      payload: jsonToPayload(payload),
      contentType: 'application/json',
      attributes: [
        PROJECT_ATTRIBUTE,
        { key: 'entityType', value: ENTITY_TYPE.CREDENTIAL },
        { key: 'ownerAddress', value: owner },
        { key: 'profileEntityKey', value: profileEntityKey },
        { key: 'credentialId', value: credential.id },
        { key: 'credentialType', value: credential.type },
        { key: 'createdAt', value: Date.parse(credential.createdAt) || Date.now() },
      ],
      expiresIn: expirySeconds(),
    });

    if (credential.tags.length > 0) {
      await wallet.mutateEntities({
        creates: credential.tags.map((tag) => ({
          payload: jsonToPayload({
            credentialId: credential.id,
            skill: tag,
            profileEntityKey,
            credentialEntityKey: entityKey,
          }),
          contentType: 'application/json',
          attributes: [
            PROJECT_ATTRIBUTE,
            { key: 'entityType', value: ENTITY_TYPE.CREDENTIAL_SKILL },
            { key: 'ownerAddress', value: owner },
            { key: 'profileEntityKey', value: profileEntityKey },
            { key: 'credentialEntityKey', value: entityKey },
            { key: 'skill', value: tag.toLowerCase() },
          ],
          expiresIn: expirySeconds(),
        })),
      });
    }

    console.log('[arkiv] credential entity', { entityKey, txHash, profileEntityKey });
    return { entityKey, txHash };
  } catch (err) {
    console.error('[arkiv] storeCredentialEntity failed', err);
    throw new ArkivError('Failed to store credential on Arkiv', err);
  }
}

/** Store peer verification entity linked to credential. */
export async function storeVerificationEntity(input: {
  credentialEntityKey: string;
  profileEntityKey: string;
  credentialId: string;
  verifierAddress: string;
  ownerAddress: string;
  message: string | null;
}): Promise<ArkivWriteResult> {
  const verifier = input.verifierAddress.toLowerCase();
  const owner = input.ownerAddress.toLowerCase();
  const payload = {
    credentialId: input.credentialId,
    credentialEntityKey: input.credentialEntityKey,
    verifierAddress: verifier,
    message: input.message,
    verifiedAt: new Date().toISOString(),
  };

  if (!hasArkivWallet()) {
    const result = local.localCreateEntity({
      entityType: ENTITY_TYPE.VERIFICATION,
      payload,
      contentType: 'application/json',
      attributes: {
        ownerAddress: owner,
        profileEntityKey: input.profileEntityKey,
        credentialEntityKey: input.credentialEntityKey,
        verifierAddress: verifier,
      },
      ownerAddress: verifier,
      creatorAddress: getArkivCreatorAddress() || verifier,
      expiresInSeconds: expirySeconds(),
      seed: `verification:${input.credentialId}:${verifier}`,
    });
    return { entityKey: result.entityKey, txHash: result.txHash };
  }

  try {
    const wallet = getArkivWalletClient();
    const { entityKey, txHash } = await wallet.createEntity({
      payload: jsonToPayload(payload),
      contentType: 'application/json',
      attributes: [
        PROJECT_ATTRIBUTE,
        { key: 'entityType', value: ENTITY_TYPE.VERIFICATION },
        { key: 'ownerAddress', value: owner },
        { key: 'profileEntityKey', value: input.profileEntityKey },
        { key: 'credentialEntityKey', value: input.credentialEntityKey },
        { key: 'credentialId', value: input.credentialId },
        { key: 'verifierAddress', value: verifier },
      ],
      expiresIn: expirySeconds(),
    });
    console.log('[arkiv] verification entity', { entityKey, txHash });
    return { entityKey, txHash };
  } catch (err) {
    console.error('[arkiv] storeVerificationEntity failed', err);
    throw new ArkivError('Failed to store verification on Arkiv', err);
  }
}

export async function getEntityPayload(entityKey: string): Promise<Credential | null> {
  if (!hasArkivWallet()) {
    const entity = local.localGetEntity(entityKey);
    return (entity?.payload as Credential | undefined) ?? null;
  }
  try {
    const entity = await getArkivPublicClient().getEntity(entityKey);
    return entity.toJson() as Credential;
  } catch (err) {
    console.error('[arkiv] getEntityPayload failed', err);
    return null;
  }
}

export async function verifyEntity(entityKey: string): Promise<ArkivEntityProof> {
  if (!hasArkivWallet()) {
    const entity = local.localGetEntity(entityKey);
    const v = local.localVerify(entityKey);
    return {
      entityKey,
      exists: v.exists,
      owner: v.owner,
      creator: v.creator,
      expiresAt: entity?.metadata.expiresAt ?? null,
      payload: entity?.payload ?? null,
      contentType: entity?.contentType ?? null,
    };
  }

  try {
    const entity = await getArkivPublicClient().getEntity(entityKey);
    const meta = entity.metadata;
    return {
      entityKey,
      exists: true,
      owner: (meta?.owner as string | undefined)?.toLowerCase() ?? null,
      creator: (meta?.creator as string | undefined)?.toLowerCase() ?? null,
      expiresAt: meta?.expiresAt ? Number(meta.expiresAt) * 1000 : null,
      payload: entity.toJson(),
      contentType: entity.contentType ?? null,
    };
  } catch (err) {
    console.error('[arkiv] verifyEntity failed', err);
    return {
      entityKey,
      exists: false,
      owner: null,
      creator: null,
      expiresAt: null,
      payload: null,
      contentType: null,
    };
  }
}

export async function queryCredentialsByAddress(ownerAddress: string): Promise<Credential[]> {
  const owner = ownerAddress.toLowerCase();

  if (!hasArkivWallet()) {
    return local
      .localQuery({ entityType: ENTITY_TYPE.CREDENTIAL, ownerAddress: owner })
      .map((e) => e.payload as Credential);
  }

  try {
    const creator = getArkivCreatorAddress();
    let query = getArkivPublicClient()
      .buildQuery()
      .where([
        eq(PROJECT_ATTRIBUTE.key, PROJECT_ATTRIBUTE.value),
        eq('entityType', ENTITY_TYPE.CREDENTIAL),
        eq('ownerAddress', owner),
      ]);
    if (creator) query = query.createdBy(creator as `0x${string}`);
    const result = await query.withPayload(true).limit(200).fetch();
    return result.entities.map((e) => e.toJson() as Credential);
  } catch (err) {
    console.error('[arkiv] queryCredentialsByAddress failed', err);
    return [];
  }
}

export async function queryProfilesBySkill(skill: string): Promise<string[]> {
  const needle = skill.toLowerCase();

  if (!hasArkivWallet()) {
    return local
      .localQuery({ entityType: ENTITY_TYPE.CREDENTIAL_SKILL, skill: needle })
      .map((e) => String(e.attributes.profileEntityKey))
      .filter(Boolean);
  }

  try {
    const creator = getArkivCreatorAddress();
    let query = getArkivPublicClient()
      .buildQuery()
      .where([
        eq(PROJECT_ATTRIBUTE.key, PROJECT_ATTRIBUTE.value),
        eq('entityType', ENTITY_TYPE.CREDENTIAL_SKILL),
        eq('skill', needle),
      ]);
    if (creator) query = query.createdBy(creator as `0x${string}`);
    const result = await query.withAttributes(true).limit(200).fetch();
    const keys = new Set<string>();
    for (const entity of result.entities) {
      const profileKey = entity.attributes?.find((a) => a.key === 'profileEntityKey')?.value;
      if (profileKey) keys.add(String(profileKey));
    }
    return [...keys];
  } catch (err) {
    console.error('[arkiv] queryProfilesBySkill failed', err);
    return [];
  }
}

/** @deprecated Use verifyEntity - kept for API compat */
export async function verifyCredential(entityKey: string): Promise<{ exists: boolean; blockNumber: number }> {
  const proof = await verifyEntity(entityKey);
  return { exists: proof.exists, blockNumber: proof.exists ? 1 : 0 };
}

/** Legacy alias */
export const storeCredential = storeCredentialEntity;
export const storeProfile = ensureProfileEntity;

export class ArkivClient {
  readonly network = 'braga';
  readonly hasRemote = hasArkivWallet();

  storeCredential = storeCredentialEntity;
  getCredential = getEntityPayload;
  queryCredentials = queryCredentialsByAddress;
  queryBySkill = async (skill: string) => {
    const profileKeys = await queryProfilesBySkill(skill);
    const all: Credential[] = [];
    for (const key of profileKeys) {
      // credentials linked via profile key
      if (!hasArkivWallet()) {
        all.push(
          ...local
            .localQuery({ entityType: ENTITY_TYPE.CREDENTIAL, profileEntityKey: key })
            .map((e) => e.payload as Credential)
        );
      }
    }
    if (hasArkivWallet()) {
      const creator = getArkivCreatorAddress();
      let query = getArkivPublicClient()
        .buildQuery()
        .where([
          eq(PROJECT_ATTRIBUTE.key, PROJECT_ATTRIBUTE.value),
          eq('entityType', ENTITY_TYPE.CREDENTIAL_SKILL),
          eq('skill', skill.toLowerCase()),
        ]);
      if (creator) query = query.createdBy(creator as `0x${string}`);
      const skills = await query.withAttributes(true).withPayload(false).limit(200).fetch();
      for (const se of skills.entities) {
        const credKey = se.attributes?.find((a) => a.key === 'credentialEntityKey')?.value;
        if (credKey) {
          const payload = await getEntityPayload(String(credKey));
          if (payload) all.push(payload);
        }
      }
    }
    return all;
  };
  verifyCredential = verifyCredential;
  storeProfile = ensureProfileEntity;
}

export const arkiv = new ArkivClient();
export { ArkivError };
