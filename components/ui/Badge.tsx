'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { CredentialType } from '@/types';

const TYPE_STYLES: Record<CredentialType, string> = {
  WORK: 'bg-type-work/15 text-type-work border-type-work/30',
  PROJECT: 'bg-type-project/15 text-indigo-300 border-type-project/30',
  SKILL: 'bg-type-skill/15 text-type-skill border-type-skill/30',
  EDUCATION: 'bg-type-education/15 text-type-education border-type-education/30',
  HACKATHON: 'bg-type-hackathon/15 text-type-hackathon border-type-hackathon/30',
  CERTIFICATION: 'bg-type-certification/15 text-purple-300 border-type-certification/30',
  CONTRIBUTION: 'bg-type-contribution/15 text-type-contribution border-type-contribution/30',
};

export function Badge({
  children,
  className,
  variant = 'default',
}: {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'muted';
}) {
  const styles = {
    default: 'bg-primary-muted text-indigo-300 border-primary/30',
    success: 'bg-secondary-muted text-secondary border-secondary/30',
    muted: 'bg-white/5 text-text-secondary border-border',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function TypeBadge({ type, className }: { type: CredentialType; className?: string }) {
  const meta: Record<CredentialType, string> = {
    WORK: 'Work',
    PROJECT: 'Project',
    SKILL: 'Skill',
    EDUCATION: 'Education',
    HACKATHON: 'Hackathon',
    CERTIFICATION: 'Certification',
    CONTRIBUTION: 'Contribution',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
        TYPE_STYLES[type],
        className
      )}
    >
      {meta[type]}
    </span>
  );
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-border bg-white/[0.03] px-2.5 py-0.5 text-xs text-text-secondary transition-colors hover:border-border-bright hover:text-text-primary',
        className
      )}
    >
      {children}
    </span>
  );
}
