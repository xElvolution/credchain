'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, ExternalLink, X, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { TypeBadge, Chip } from '@/components/ui/Badge';
import { CopyButton } from '@/components/ui/CopyButton';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { VerificationBadge } from '@/components/credentials/VerificationBadge';
import { truncateAddress, truncateHash, arkivExplorerUrl, bragaTxUrl, formatDate, formatDateRange } from '@/lib/utils';
import type { CredentialType } from '@/types';

export default function VerifyPage() {
  const params = useParams<{ credentialId: string }>();
  const id = params?.credentialId;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/credentials/proof?id=${id}`);
        const json = await res.json();
        setData(json);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="container-x pt-24">
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (!data?.credential) {
    return (
      <div className="container-x flex min-h-screen items-center justify-center pt-24">
        <Card hover={false} className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10">
            <X className="text-rose-400" size={24} />
          </div>
          <h1 className="text-2xl font-bold">Credential not found</h1>
          <p className="mt-2 text-text-secondary">This entity was not found on Arkiv Braga.</p>
        </Card>
      </div>
    );
  }

  const c = data.credential;
  const proof = data.proof;
  const verified = proof.arkivVerified;

  return (
    <div className="container-x pt-24 pb-section">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center justify-center"
        >
          {verified ? (
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-secondary/20 blur-2xl"
              />
              <div className="relative flex items-center gap-3 rounded-full border-2 border-secondary/40 bg-secondary-muted px-6 py-3 text-secondary">
                <motion.span
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
                >
                  <Check size={22} strokeWidth={3} />
                </motion.span>
                <span className="text-base font-bold uppercase tracking-wide">Verified on Braga</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-full border-2 border-rose-500/40 bg-rose-500/10 px-6 py-3 text-rose-300">
              <X size={22} strokeWidth={3} />
              <span className="text-base font-bold uppercase tracking-wide">Not Found</span>
            </div>
          )}
        </motion.div>

        <Card hover={false} className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <TypeBadge type={c.type as CredentialType} />
            <span className="mono text-xs text-muted">{formatDate(c.createdAt)}</span>
          </div>

          <div>
            <h1 className="heading-section">{c.title}</h1>
            <p className="mt-2 text-lg text-text-secondary">{c.organization}</p>
            {(c.startDate || c.endDate) && (
              <p className="mono mt-1 text-sm text-muted">{formatDateRange(c.startDate, c.endDate)}</p>
            )}
          </div>

          {c.description && (
            <p className="text-base leading-relaxed text-text-secondary">{c.description}</p>
          )}

          {c.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {c.tags.map((t: string) => <Chip key={t}>{t}</Chip>)}
            </div>
          )}

          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">Owner</p>
            <Link href={`/profile/${c.ownerAddress}`} className="mt-2 flex items-center gap-3 hover:opacity-80">
              <Avatar address={c.ownerAddress} size={40} />
              <div>
                <p className="font-semibold">{c.user?.username || truncateAddress(c.ownerAddress)}</p>
                <p className="mono text-xs text-text-secondary">{c.ownerAddress}</p>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <ProofRow
              label="Arkiv Entity Key"
              value={c.arkivEntityKey}
              link={c.arkivEntityKey ? arkivExplorerUrl(c.arkivEntityKey) : undefined}
              copyable
            />
            <ProofRow
              label="Braga Tx"
              value={c.txHash}
              link={c.txHash ? bragaTxUrl(c.txHash) : undefined}
              copyable
            />
            {proof.arkivOwner && (
              <ProofRow label="$owner" value={proof.arkivOwner} copyable />
            )}
            {proof.arkivCreator && (
              <ProofRow label="$creator" value={proof.arkivCreator} copyable />
            )}
            {proof.arkivExpiresAt && (
              <ProofRow
                label="Expires"
                value={new Date(proof.arkivExpiresAt).toISOString()}
                icon={Clock}
              />
            )}
            {c.profileEntityKey && (
              <ProofRow
                label="Profile entity"
                value={c.profileEntityKey}
                link={arkivExplorerUrl(c.profileEntityKey)}
                copyable
              />
            )}
          </div>

          {c.verifications?.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-semibold">Endorsements ({c.verifications.length})</p>
              <div className="flex flex-wrap gap-2">
                {c.verifications.map((v: any) => (
                  <VerificationBadge
                    key={v.id}
                    verifierAddress={v.verifier?.address || ''}
                    date={v.createdAt}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border pt-4 text-center text-sm text-text-secondary">
            Anyone can verify this. Right now. Forever.
          </div>
        </Card>
      </div>
    </div>
  );
}

function ProofRow({
  label, value, link, copyable, icon: Icon,
}: { label: string; value?: string | null; link?: string; copyable?: boolean; icon?: any }) {
  if (!value) {
    return (
      <div className="rounded-lg border border-border bg-surface p-3">
        <p className="text-xs text-muted">{label}</p>
        <p className="mt-1 text-sm text-muted">—</p>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="flex items-center gap-1 text-xs text-muted">
        {Icon && <Icon size={11} />} {label}
      </p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="mono truncate text-sm text-text-primary">{truncateHash(value, 14, 8)}</span>
        <div className="flex items-center gap-1">
          {copyable && <CopyButton value={value} label={label} />}
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="rounded p-1 text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
