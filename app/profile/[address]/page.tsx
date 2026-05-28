'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { TypeBadge, Chip } from '@/components/ui/Badge';
import { CopyButton } from '@/components/ui/CopyButton';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ReputationRing } from '@/components/profile/ProfileStats';
import { ActivityFeed } from '@/components/profile/ActivityFeed';
import { VerificationBadge } from '@/components/credentials/VerificationBadge';
import { useProfile } from '@/hooks/useProfile';
import { useCredentials } from '@/hooks/useCredentials';
import { useWallet } from '@/hooks/useWallet';
import { formatDate, formatDateRange, truncateHash, bragaTxUrl } from '@/lib/utils';
import type { CredentialType } from '@/types';
import toast from 'react-hot-toast';

export default function PublicProfilePage() {
  const params = useParams<{ address: string }>();
  const addr = (params?.address || '').toLowerCase();
  const { address: myAddress } = useWallet();
  const { profile, loading, fetchProfile } = useProfile(addr);
  const { verifyCredential } = useCredentials();
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifyMsg, setVerifyMsg] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const isOwner = myAddress?.toLowerCase() === addr;

  const skillTally = useMemo(() => {
    const map = new Map<string, number>();
    profile?.credentials.forEach((c) => c.tags.forEach((t) => map.set(t, (map.get(t) || 0) + 1)));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [profile]);

  const byYear = useMemo(() => {
    if (!profile) return [] as [number, any[]][];
    const map = new Map<number, any[]>();
    profile.credentials.forEach((c) => {
      const year = new Date(c.endDate || c.startDate || c.createdAt).getFullYear();
      if (!map.has(year)) map.set(year, []);
      map.get(year)!.push(c);
    });
    return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
  }, [profile]);

  async function submitVerification() {
    if (!verifyingId) return;
    try {
      await verifyCredential(verifyingId, verifyMsg);
      setVerifyingId(null);
      setVerifyMsg('');
      fetchProfile(addr);
    } catch {}
  }

  if (!loading && !profile) {
    return (
      <div className="container-x flex min-h-screen items-center justify-center pt-24">
        <Card hover={false} className="text-center">
          <h1 className="text-2xl font-bold">No profile yet</h1>
          <p className="mt-2 text-text-secondary">This address has no credentials on CREDCHAIN.</p>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return <div className="container-x pt-24"><div className="h-64 animate-pulse rounded-2xl bg-card" /></div>;
  }

  return (
    <div className="container-x pt-24 pb-section">
      <Card hover={false} className="relative overflow-hidden">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative">
          <ProfileHeader
            profile={profile}
            isOwner={isOwner}
            onVerify={() => toast('Click "Verify this" under any credential to endorse it.')}
          />
        </div>
      </Card>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-10">
          <section>
            <h2 className="mb-6 text-xl font-semibold">Credentials</h2>
            {byYear.length === 0 ? (
              <p className="text-sm text-muted">No credentials yet.</p>
            ) : (
              <div className="relative">
                <div className="absolute bottom-0 left-3 top-0 w-px bg-gradient-to-b from-primary/40 via-border to-transparent" />
                {byYear.map(([year, items]) => (
                  <div key={year} className="mb-10">
                    <div className="mb-4 flex items-center gap-3 pl-8">
                      <span className="mono text-sm font-semibold text-text-secondary">{year}</span>
                      <span className="h-px flex-1 bg-border" />
                    </div>
                    <div className="space-y-4">
                      {items.map((c) => {
                        const isOpen = expanded.has(c.id);
                        const verifs = ((c as any).verifications ?? []) as any[];
                        return (
                          <motion.div
                            key={c.id}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4 }}
                            className="relative pl-8"
                          >
                            <div className="absolute left-0 top-3 flex h-6 w-6 items-center justify-center">
                              <span className="h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                            </div>
                            <Card className="space-y-3">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <TypeBadge type={c.type as CredentialType} />
                                  <span className="mono text-xs text-muted">
                                    {(c.startDate || c.endDate) ? formatDateRange(c.startDate, c.endDate) : formatDate(c.createdAt)}
                                  </span>
                                </div>
                                {c.verified && c.verifiedBy && (
                                  <VerificationBadge verifierAddress={c.verifiedBy} date={c.createdAt} />
                                )}
                              </div>
                              <div>
                                <h3 className="text-base font-semibold">{c.title}</h3>
                                <p className="text-sm text-text-secondary">{c.organization}</p>
                              </div>
                              {c.description && (
                                <button
                                  onClick={() => {
                                    setExpanded((s) => {
                                      const next = new Set(s);
                                      if (next.has(c.id)) next.delete(c.id); else next.add(c.id);
                                      return next;
                                    });
                                  }}
                                  className="block text-left"
                                >
                                  <p className={isOpen ? 'text-sm leading-relaxed text-text-secondary' : 'line-clamp-2 text-sm leading-relaxed text-text-secondary'}>
                                    {c.description}
                                  </p>
                                  <span className="mt-1 text-xs text-primary">{isOpen ? 'Show less' : 'Show more'}</span>
                                </button>
                              )}
                              {c.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {c.tags.map((t: string) => <Chip key={t}>{t}</Chip>)}
                                </div>
                              )}
                              <div className="grid grid-cols-1 gap-2 border-t border-border pt-3 text-xs sm:grid-cols-2">
                                {c.arkivEntityKey && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted">Arkiv</span>
                                    <span className="mono flex items-center gap-1 text-text-secondary">
                                      {truncateHash(c.arkivEntityKey, 10, 6)}
                                      <CopyButton value={c.arkivEntityKey} label="Entity key" />
                                    </span>
                                  </div>
                                )}
                                {c.txHash && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted">Braga tx</span>
                                    <a
                                      href={bragaTxUrl(c.txHash)}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="mono text-primary hover:opacity-80"
                                    >
                                      {truncateHash(c.txHash)}
                                    </a>
                                  </div>
                                )}
                              </div>
                              {!isOwner && myAddress && (
                                <Button size="sm" variant="ghost" onClick={() => setVerifyingId(c.id)}>
                                  Verify this
                                </Button>
                              )}
                              {verifs.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {verifs.map((v: any) => (
                                    <VerificationBadge key={v.id} verifierAddress={v.verifier?.address || ''} date={v.createdAt} />
                                  ))}
                                </div>
                              )}
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {skillTally.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-semibold">Skills</h2>
              <Card hover={false}>
                <div className="flex flex-wrap items-center gap-2">
                  {skillTally.map(([skill, count]) => (
                    <span
                      key={skill}
                      title={`${count} credential${count === 1 ? '' : 's'}`}
                      className="rounded-full border border-border bg-white/[0.03] px-3 py-1 text-text-primary transition-colors hover:border-primary"
                      style={{ fontSize: `${Math.min(20, 12 + count * 1.5)}px` }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </Card>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <Card hover={false} className="flex flex-col items-center">
            <p className="text-xs uppercase tracking-wider text-muted">Reputation</p>
            <div className="mt-4">
              <ReputationRing score={profile.reputationScore ?? 0} />
            </div>
            <p className="mt-4 text-center text-xs text-text-secondary">
              credentials × verifications × diversity
            </p>
          </Card>

          <Card hover={false}>
            <h3 className="mb-3 text-sm font-semibold">Recent activity</h3>
            <ActivityFeed credentials={profile.credentials} verifications={(profile as any).verifications} />
          </Card>

          <Card hover={false} className="border-secondary/30 bg-secondary-muted/40">
            <p className="mono text-xs text-secondary">credchain.xyz/{addr.slice(0, 10)}…</p>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              This profile is permanently stored on Arkiv Braga. Anyone can verify it. Forever.
            </p>
          </Card>
        </aside>
      </div>

      <Modal open={!!verifyingId} onClose={() => setVerifyingId(null)} title="Verify this credential">
        <p className="text-sm text-text-secondary">
          Your endorsement is recorded on-chain. Add an optional note explaining how you know this is real.
        </p>
        <div className="mt-4">
          <Textarea
            placeholder="Optional message"
            value={verifyMsg}
            onChange={(e) => setVerifyMsg(e.target.value)}
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setVerifyingId(null)}>Cancel</Button>
          <Button onClick={submitVerification}>Verify</Button>
        </div>
      </Modal>
    </div>
  );
}
