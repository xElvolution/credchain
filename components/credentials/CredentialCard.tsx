'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, ExternalLink, Link2, Share2 } from 'lucide-react';
import type { Credential } from '@/types';
import { TypeBadge, Chip } from '@/components/ui/Badge';
import { CopyButton } from '@/components/ui/CopyButton';
import { formatDateRange, truncateHash, bragaTxUrl, copyToClipboard } from '@/lib/utils';
import { staggerItem } from '@/components/animations/variants';
import toast from 'react-hot-toast';

interface CredentialCardProps {
  credential: Credential & { verifications?: { length?: number }[] };
}

export function CredentialCard({ credential }: CredentialCardProps) {
  const c = credential;
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="card-base card-hover flex flex-col gap-4 p-6"
    >
      <div className="flex items-start justify-between gap-2">
        <TypeBadge type={c.type} />
        {c.verified && (
          <span className="inline-flex items-center gap-1 rounded-full border border-secondary/30 bg-secondary-muted px-2 py-0.5 text-xs font-medium text-secondary">
            <Check size={11} strokeWidth={3} /> Verified
          </span>
        )}
      </div>

      <div>
        <h3 className="text-base font-semibold leading-tight">{c.title}</h3>
        <p className="mt-1 text-sm text-text-secondary">{c.organization}</p>
        {(c.startDate || c.endDate) && (
          <p className="mono mt-1 text-xs text-muted">{formatDateRange(c.startDate, c.endDate)}</p>
        )}
      </div>

      {c.description && (
        <p className="line-clamp-2 text-sm leading-relaxed text-text-secondary">{c.description}</p>
      )}

      {c.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {c.tags.slice(0, 6).map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
        </div>
      )}

      <div className="mt-auto space-y-2 border-t border-border pt-3">
        {c.arkivEntityKey && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Arkiv entity</span>
            <span className="mono flex items-center gap-1 text-text-secondary">
              {truncateHash(c.arkivEntityKey, 10, 6)}
              <CopyButton value={c.arkivEntityKey} label="Entity key" />
            </span>
          </div>
        )}
        {c.txHash && (
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-muted">
              <Link2 size={11} /> Braga tx
            </span>
            <a
              href={bragaTxUrl(c.txHash)}
              target="_blank"
              rel="noreferrer"
              className="mono flex items-center gap-1 text-primary transition-colors hover:opacity-80"
            >
              {truncateHash(c.txHash)}
              <ExternalLink size={11} />
            </a>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/verify/${c.id}`}
          className="flex-1 rounded-lg border border-border-bright py-2 text-center text-xs font-medium text-text-secondary transition-colors hover:border-primary hover:text-text-primary"
        >
          View proof
        </Link>
        <button
          onClick={async () => {
            try {
              await copyToClipboard(`${window.location.origin}/verify/${c.id}`);
              toast.success('Share link copied');
            } catch {
              toast.error('Copy failed');
            }
          }}
          className="rounded-lg border border-border-bright p-2 text-text-secondary transition-colors hover:border-primary hover:text-text-primary"
          aria-label="Share"
        >
          <Share2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}
