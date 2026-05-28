'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Database, LinkIcon, FileX2, ArrowRight, Search } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { CounterAnimation } from '@/components/animations/CounterAnimation';
import { MagneticButton } from '@/components/animations/MagneticButton';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Badge';
import { CREDENTIAL_TYPES, CREDENTIAL_TYPE_META } from '@/types';
import { CREDENTIAL_TYPE_ICON } from '@/lib/credential-icons';
import { staggerContainer, staggerItem } from '@/components/animations/variants';
import { useEffect, useRef, useState } from 'react';
import { useDrawLine } from '@/components/animations/GSAPWrapper';
import { truncateAddress } from '@/lib/utils';

export function ProblemSection() {
  const pains = [
    { icon: FileX2, title: 'LinkedIn owns your data', desc: 'Your professional identity lives on a platform that can delete it, gate it, or sell it.' },
    { icon: LinkIcon, title: 'IPFS pins expire', desc: 'Decentralized in name only - unpinned data vanishes when nobody pays to keep it alive.' },
    { icon: Database, title: 'Resumes can’t be verified', desc: 'Anyone can claim anything. Employers have no cryptographic way to check the truth.' },
  ];
  return (
    <section className="border-y border-border bg-surface py-section">
      <div className="container-x">
        <ScrollReveal>
          <h2 className="heading-section max-w-2xl">The credential system is broken.</h2>
        </ScrollReveal>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {pains.map((p, i) => (
            <ScrollReveal key={p.title} delay={i * 0.1}>
              <div className="card-base h-full p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
                  <p.icon size={20} />
                </div>
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{p.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    { n: 1, title: 'Connect wallet', desc: 'Sign in with Privy. No passwords, no platform account.' },
    { n: 2, title: 'Publish to Arkiv', desc: 'Profile + credential entities are created on Braga testnet.' },
    { n: 3, title: 'Get endorsed', desc: 'Peers publish verification entities linked to your credential on Braga.' },
    { n: 4, title: 'Share your profile', desc: 'Anyone can verify $owner, $creator, and entity keys forever.' },
  ];
  const lineRef = useDrawLine();
  return (
    <section className="py-section">
      <div className="container-x">
        <ScrollReveal>
          <h2 className="heading-section">How it works</h2>
        </ScrollReveal>
        <div className="relative mt-14">
          <svg className="absolute left-0 top-7 hidden h-2 w-full md:block" preserveAspectRatio="none" viewBox="0 0 1000 2">
            <path ref={lineRef} d="M0 1 L1000 1" stroke="url(#stepGrad)" strokeWidth="2" fill="none" />
            <defs>
              <linearGradient id="stepGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#A78BFA" />
              </linearGradient>
            </defs>
          </svg>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {steps.map((s, i) => (
              <ScrollReveal key={s.n} delay={i * 0.12}>
                <div className="relative">
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-border-bright bg-card text-lg font-bold text-primary">
                    {s.n}
                  </div>
                  <h3 className="mt-5 text-base font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CredentialTypes() {
  return (
    <section className="border-y border-border bg-surface py-section">
      <div className="container-x">
        <ScrollReveal>
          <h2 className="heading-section">Every kind of credential.</h2>
          <p className="mt-3 max-w-xl text-text-secondary">From your first commit to your latest role - all of it, verifiable.</p>
        </ScrollReveal>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {CREDENTIAL_TYPES.map((t) => {
            const meta = CREDENTIAL_TYPE_META[t];
            const Icon = CREDENTIAL_TYPE_ICON[t];
            return (
              <motion.div
                key={t}
                variants={staggerItem}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="card-base card-hover group flex flex-col gap-3 p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-primary-muted text-primary">
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <h3 className="text-base font-semibold">{meta.label}</h3>
                <p className="text-sm text-text-secondary">{meta.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

const STAT_LABELS = [
  { key: 'credentialsIssued', label: 'Credentials Issued' },
  { key: 'verifications', label: 'Verifications' },
  { key: 'builders', label: 'Builders Registered' },
  { key: 'organizations', label: 'Organizations' },
] as const;

export function LiveStats() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/stats')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setStats(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="py-section">
      <div className="container-x">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STAT_LABELS.map((s) => {
            const value = stats?.[s.key] ?? 0;
            return (
              <ScrollReveal key={s.label} className="text-center">
                <p className="text-gradient-accent text-4xl font-bold sm:text-5xl">
                  {stats === null ? (
                    <span className="text-text-secondary">-</span>
                  ) : (
                    <CounterAnimation target={value} />
                  )}
                </p>
                <p className="mt-2 text-sm text-text-secondary">{s.label}</p>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

interface BuilderResult {
  user: { address: string; username: string | null; avatar: string | null; bio: string | null };
  credentialCount: number;
  topSkills: string[];
}

export function FeaturedBuilders() {
  const [builders, setBuilders] = useState<BuilderResult[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/search?sort=reputation')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setBuilders((d.results || []).slice(0, 6));
      })
      .catch(() => {
        if (!cancelled) setBuilders([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="border-y border-border bg-surface py-section">
      <div className="container-x">
        <ScrollReveal className="flex items-end justify-between gap-4">
          <h2 className="heading-section">Featured builders</h2>
          <Link href="/explore" className="hidden text-sm font-medium text-primary hover:underline sm:inline">
            View all <ArrowRight className="inline" size={14} />
          </Link>
        </ScrollReveal>

        {builders === null ? (
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-base h-[92px] animate-pulse p-5" />
            ))}
          </div>
        ) : builders.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-primary-muted text-primary">
              <Search size={20} strokeWidth={1.75} />
            </div>
            <p className="text-base font-semibold">No builders yet - be the first.</p>
            <p className="max-w-md text-sm text-text-secondary">
              Publish a credential to Arkiv Braga and your profile shows up here.
            </p>
            <Link href="/dashboard" className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
              Publish credential <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {builders.map((b, i) => (
              <ScrollReveal key={b.user.address} delay={i * 0.06}>
                <Link href={`/profile/${b.user.address}`} className="card-base card-hover group flex items-center gap-4 p-5">
                  <Avatar address={b.user.address} src={b.user.avatar} size={52} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {b.user.username || truncateAddress(b.user.address)}
                    </p>
                    {b.topSkills.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {b.topSkills.slice(0, 3).map((s) => (
                          <Chip key={s}>{s}</Chip>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="mono text-lg font-bold">{b.credentialCount}</p>
                    <p className="text-xs text-muted">creds</p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

interface SearchHit {
  user: { address: string; username: string | null };
  credentialCount: number;
}

export function EmployerSection() {
  const [typed, setTyped] = useState('');
  const [results, setResults] = useState<SearchHit[] | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);
  const target = 'Solidity';

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          let i = 0;
          const interval = setInterval(() => {
            i++;
            setTyped(target.slice(0, i));
            if (i >= target.length) {
              clearInterval(interval);
              fetch(`/api/search?skill=${encodeURIComponent(target)}`)
                .then((r) => r.json())
                .then((d) => setResults((d.results || []).slice(0, 3)))
                .catch(() => setResults([]));
            }
          }, 80);
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="py-section" ref={ref}>
      <div className="container-x grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <ScrollReveal>
          <h2 className="heading-section">Hire from on-chain proof.</h2>
          <p className="mt-4 text-text-secondary">
            Skip the LinkedIn scroll. Query Arkiv directly: skills, organizations, hackathon wins -
            every credential carries cryptographic proof.
          </p>
          <Link href="/explore" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            Try the search <ArrowRight size={14} />
          </Link>
        </ScrollReveal>

        <ScrollReveal>
          <div className="card-base p-6">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-3">
              <Search size={16} className="text-text-secondary" />
              <span className="mono text-sm">{typed}<span className="opacity-60">|</span></span>
            </div>
            <div className="mt-4 space-y-2">
              {results === null ? (
                <p className="text-xs text-muted">Waiting for query…</p>
              ) : results.length === 0 ? (
                <p className="text-xs text-muted">No matches yet - be the first builder with this skill.</p>
              ) : (
                results.map((r, i) => (
                  <motion.div
                    key={r.user.address}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white/[0.02] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-sm font-medium">{r.user.username || truncateAddress(r.user.address)}</span>
                    </div>
                    <span className="mono text-xs text-text-secondary">{r.credentialCount} credentials</span>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export function CTABand() {
  return (
    <section className="relative overflow-hidden py-section">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-background" />
      <div className="container-x relative text-center">
        <ScrollReveal>
          <h2 className="heading-section mx-auto max-w-2xl">Start building your on-chain reputation.</h2>
          <Link href="/dashboard" className="mt-8 inline-block">
            <MagneticButton className="inline-flex h-14 items-center gap-2 rounded-lg bg-primary px-10 text-base font-semibold text-primary-foreground shadow-[0_0_40px_-6px_rgba(124,58,237,0.6)] hover:bg-primary-hover">
              Get Started <ArrowRight size={18} />
            </MagneticButton>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
