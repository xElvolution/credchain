/**
 * Globally unique project attribute - required on every entity and query.
 * @see https://docs.arkiv.network/typescript-sdk/best-practices/
 */
import { BRAGA_EXPLORER_BASE } from '@/lib/braga-chain';

export const PROJECT_ATTRIBUTE = {
  key: 'project',
  value: 'credchain-arkiv-hackathon-v1',
} as const;

/** Entity type attribute values (at least 2 required by challenge). */
export const ENTITY_TYPE = {
  PROFILE: 'profile',
  CREDENTIAL: 'credential',
  CREDENTIAL_SKILL: 'credentialSkill',
  VERIFICATION: 'verification',
} as const;

export type EntityType = (typeof ENTITY_TYPE)[keyof typeof ENTITY_TYPE];

/** Default TTL for CREDCHAIN entities on Braga. */
export const DEFAULT_EXPIRY_DAYS = 365;

export const BRAGA_EXPLORER = `${BRAGA_EXPLORER_BASE}/entity/`;

export function getCreatorWalletAddress(): string | null {
  const key = process.env.ARKIV_PRIVATE_KEY;
  if (!key) return null;
  return process.env.ARKIV_CREATOR_ADDRESS?.toLowerCase() ?? null;
}
