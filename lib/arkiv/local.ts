/**
 * In-memory fallback when ARKIV_PRIVATE_KEY is unset (local UI dev only).
 * Mirrors entity keys, attributes, and metadata shape of the real SDK.
 */

import type { EntityType } from './constants';

export interface LocalEntityMeta {
  owner: string;
  creator: string;
  expiresAt: number;
}

export interface LocalEntity {
  key: string;
  entityType: EntityType;
  payload: unknown;
  contentType: string;
  attributes: Record<string, string | number>;
  metadata: LocalEntityMeta;
  txHash: string;
}

const STORE = new Map<string, LocalEntity>();

function syntheticKey(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  const hex = Math.abs(hash).toString(16).padStart(16, '0');
  return `0x${hex}${Date.now().toString(16).padStart(12, '0')}`.slice(0, 66);
}

function syntheticTx(key: string): string {
  let hash = 5381;
  for (let i = 0; i < key.length; i++) hash = (hash * 33) ^ key.charCodeAt(i);
  return ('0x' + Math.abs(hash).toString(16).repeat(8)).slice(0, 66);
}

export function localHasRemote(): boolean {
  return false;
}

export function localCreateEntity(input: {
  entityType: EntityType;
  payload: unknown;
  contentType: string;
  attributes: Record<string, string | number>;
  ownerAddress: string;
  creatorAddress: string;
  expiresInSeconds: number;
  seed: string;
}): { entityKey: string; txHash: string } {
  const entityKey = syntheticKey(input.seed);
  const txHash = syntheticTx(entityKey);
  STORE.set(entityKey, {
    key: entityKey,
    entityType: input.entityType,
    payload: input.payload,
    contentType: input.contentType,
    attributes: { entityType: input.entityType, ...input.attributes },
    metadata: {
      owner: input.ownerAddress.toLowerCase(),
      creator: input.creatorAddress.toLowerCase(),
      expiresAt: Date.now() + input.expiresInSeconds * 1000,
    },
    txHash,
  });
  return { entityKey, txHash };
}

export function localGetEntity(entityKey: string): LocalEntity | null {
  return STORE.get(entityKey) ?? null;
}

export function localQuery(filters: {
  entityType?: EntityType;
  ownerAddress?: string;
  profileEntityKey?: string;
  credentialEntityKey?: string;
  skill?: string;
}): LocalEntity[] {
  const out: LocalEntity[] = [];
  STORE.forEach((entity) => {
    if (filters.entityType && entity.entityType !== filters.entityType) return;
    if (filters.ownerAddress && entity.attributes.ownerAddress !== filters.ownerAddress.toLowerCase()) return;
    if (filters.profileEntityKey && entity.attributes.profileEntityKey !== filters.profileEntityKey) return;
    if (filters.credentialEntityKey && entity.attributes.credentialEntityKey !== filters.credentialEntityKey)
      return;
    if (filters.skill && entity.attributes.skill !== filters.skill.toLowerCase()) return;
    out.push(entity);
  });
  return out;
}

export function localVerify(entityKey: string): { exists: boolean; owner: string | null; creator: string | null } {
  const entity = STORE.get(entityKey);
  if (!entity) return { exists: false, owner: null, creator: null };
  return {
    exists: entity.metadata.expiresAt > Date.now(),
    owner: entity.metadata.owner,
    creator: entity.metadata.creator,
  };
}
