import { Briefcase, Hammer, Target, GraduationCap, Trophy, Award, GitPullRequest, type LucideIcon } from 'lucide-react';
import type { CredentialType } from '@/types';

export const CREDENTIAL_TYPE_ICON: Record<CredentialType, LucideIcon> = {
  WORK: Briefcase,
  PROJECT: Hammer,
  SKILL: Target,
  EDUCATION: GraduationCap,
  HACKATHON: Trophy,
  CERTIFICATION: Award,
  CONTRIBUTION: GitPullRequest,
};
