export type CredentialType =
  | 'WORK'
  | 'PROJECT'
  | 'SKILL'
  | 'EDUCATION'
  | 'HACKATHON'
  | 'CERTIFICATION'
  | 'CONTRIBUTION';

export const CREDENTIAL_TYPES: CredentialType[] = [
  'WORK',
  'PROJECT',
  'SKILL',
  'EDUCATION',
  'HACKATHON',
  'CERTIFICATION',
  'CONTRIBUTION',
];

export const CREDENTIAL_TYPE_META: Record<
  CredentialType,
  { label: string; icon: string; color: string; description: string }
> = {
  WORK: { label: 'Work Experience', icon: '💼', color: 'type-work', description: 'Roles and positions held' },
  PROJECT: { label: 'Projects Built', icon: '🛠️', color: 'type-project', description: 'Things you shipped' },
  SKILL: { label: 'Skills & Technologies', icon: '🎯', color: 'type-skill', description: 'Technical proficiencies' },
  EDUCATION: { label: 'Education', icon: '🎓', color: 'type-education', description: 'Degrees and programs' },
  HACKATHON: { label: 'Hackathon Wins', icon: '🏆', color: 'type-hackathon', description: 'Competitions placed in' },
  CERTIFICATION: { label: 'Certifications', icon: '📜', color: 'type-certification', description: 'Issued credentials' },
  CONTRIBUTION: { label: 'Open Source Contributions', icon: '🤝', color: 'type-contribution', description: 'Merged PRs and commits' },
};

export interface User {
  id: string;
  address: string;
  username: string | null;
  bio: string | null;
  avatar: string | null;
  website: string | null;
  twitter: string | null;
  github: string | null;
  arkivProfileKey?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Credential {
  id: string;
  userId: string;
  type: CredentialType;
  title: string;
  organization: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  url: string | null;
  tags: string[];
  arkivEntityKey: string | null;
  txHash: string | null;
  blockNumber: number | null;
  verified: boolean;
  verifiedBy: string | null;
  createdAt: string;
}

export interface Verification {
  id: string;
  credentialId: string;
  verifierId: string;
  message: string | null;
  txHash: string | null;
  createdAt: string;
  verifier?: User;
}

export interface UserProfile extends User {
  credentials: Credential[];
  verifications?: Verification[];
  reputationScore?: number;
}

export interface SearchResult {
  user: User;
  credentialCount: number;
  verificationCount: number;
  reputationScore: number;
  topSkills: string[];
  recentCredentials?: Credential[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
