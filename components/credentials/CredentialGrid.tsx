'use client';

import { motion } from 'framer-motion';
import type { Credential } from '@/types';
import { CredentialCard } from './CredentialCard';
import { CredentialCardSkeleton } from '@/components/ui/Skeleton';
import { staggerContainer } from '@/components/animations/variants';
import { FileQuestion } from 'lucide-react';

interface CredentialGridProps {
  credentials: Credential[];
  loading?: boolean;
  emptyMessage?: string;
}

export function CredentialGrid({ credentials, loading, emptyMessage }: CredentialGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CredentialCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!credentials.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-muted">
          <FileQuestion className="text-primary" size={24} />
        </div>
        <p className="text-sm font-medium text-text-primary">No credentials yet</p>
        <p className="mt-1 max-w-xs text-sm text-text-secondary">
          {emptyMessage || 'Publish your first credential to start building your on-chain reputation.'}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {credentials.map((c) => (
        <CredentialCard key={c.id} credential={c} />
      ))}
    </motion.div>
  );
}
