'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProfileCardSkeleton } from '@/components/ui/Skeleton';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { staggerContainer, staggerItem } from '@/components/animations/variants';
import { truncateAddress, debounce } from '@/lib/utils';
import { CREDENTIAL_TYPES, type CredentialType } from '@/types';

type Sort = 'reputation' | 'credentials' | 'verifications' | 'newest';

export default function ExplorePage() {
  const [q, setQ] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [typeFilters, setTypeFilters] = useState<CredentialType[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<Sort>('reputation');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useMemo(
    () =>
      debounce(async (query: string, skill: string, sortKey: Sort, verified: boolean) => {
        setLoading(true);
        try {
          const params = new URLSearchParams();
          if (query) params.set('q', query);
          if (skill) params.set('skill', skill);
          params.set('sort', sortKey);
          if (verified) params.set('verified', 'true');
          const res = await fetch(`/api/search?${params.toString()}`);
          const json = await res.json();
          setResults(json.results || []);
        } finally {
          setLoading(false);
        }
      }, 300),
    []
  );

  useEffect(() => {
    search(q, skillFilter, sort, verifiedOnly);
  }, [q, skillFilter, sort, verifiedOnly, search]);

  const filtered = results.filter((r) => {
    if (typeFilters.length === 0) return true;
    return r.recentCredentials?.some((c: any) => typeFilters.includes(c.type));
  });

  const featured = filtered.slice(0, 3);
  const rest = filtered.slice(3);

  return (
    <div className="container-x pt-24 pb-section">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal className="text-center">
          <h1 className="heading-section">Find verified builders.</h1>
          <p className="mt-3 text-text-secondary">Search by skill, role, or organization.</p>
        </ScrollReveal>

        <div className="mt-8 flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by skill, role, or organization"
              className="h-14 w-full rounded-xl border border-border bg-card pl-12 pr-4 text-base text-text-primary placeholder:text-muted focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4">
          <Card hover={false} className="space-y-5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-muted" />
              <p className="text-sm font-semibold">Filters</p>
            </div>

            <Input
              label="Skill"
              placeholder="e.g. Solidity"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
            />

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Credential type</p>
              <div className="flex flex-wrap gap-1.5">
                {CREDENTIAL_TYPES.map((t) => {
                  const active = typeFilters.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() =>
                        setTypeFilters((prev) =>
                          active ? prev.filter((x) => x !== t) : [...prev, t]
                        )
                      }
                      className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                        active
                          ? 'border-primary bg-primary-muted text-text-primary'
                          : 'border-border text-text-secondary hover:border-border-bright'
                      }`}
                    >
                      {t.toLowerCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Verified only</span>
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="h-4 w-8 cursor-pointer appearance-none rounded-full bg-white/[0.06] transition-colors checked:bg-primary"
              />
            </label>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Sort</p>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    ['reputation', 'Score'],
                    ['credentials', 'Most creds'],
                    ['verifications', 'Verifs'],
                    ['newest', 'Newest'],
                  ] as [Sort, string][]
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSort(key)}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
                      sort === key
                        ? 'border-primary bg-primary-muted text-text-primary'
                        : 'border-border text-text-secondary hover:border-border-bright'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </aside>

        <section className="space-y-8">
          {featured.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">Top Builders</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {featured.map((r, i) => (
                  <motion.div
                    key={r.user.address}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Link href={`/profile/${r.user.address}`}>
                      <Card className="relative h-full overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-secondary" />
                        <div className="flex items-center gap-3">
                          <Avatar address={r.user.address} src={r.user.avatar} size={48} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{r.user.username || truncateAddress(r.user.address)}</p>
                            <p className="mono text-xs text-text-secondary">{truncateAddress(r.user.address)}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {r.topSkills.slice(0, 3).map((s: string) => (
                            <Chip key={s}>{s}</Chip>
                          ))}
                        </div>
                        <div className="mt-4 flex items-end justify-between">
                          <div>
                            <p className="mono text-2xl font-bold">{r.credentialCount}</p>
                            <p className="text-xs text-muted">credentials</p>
                          </div>
                          <div className="text-right">
                            <p className="mono text-2xl font-bold text-secondary">{r.reputationScore}</p>
                            <p className="text-xs text-muted">score</p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">All builders</p>
              <p className="text-xs text-muted">{filtered.length} result{filtered.length === 1 ? '' : 's'}</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => <ProfileCardSkeleton key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <Card hover={false} className="text-center">
                <p className="text-sm text-text-secondary">No matching builders yet.</p>
              </Card>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-4 md:grid-cols-2"
              >
                {rest.map((r) => (
                  <motion.div key={r.user.address} variants={staggerItem}>
                    <Link href={`/profile/${r.user.address}`}>
                      <Card className="flex items-center gap-4">
                        <Avatar address={r.user.address} src={r.user.avatar} size={48} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">{r.user.username || truncateAddress(r.user.address)}</p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {r.topSkills.slice(0, 3).map((s: string) => (
                              <Chip key={s}>{s}</Chip>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="mono text-lg font-bold">{r.credentialCount}</p>
                          <p className="text-xs text-muted">credentials</p>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
