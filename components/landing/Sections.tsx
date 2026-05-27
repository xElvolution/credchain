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
import { staggerContainer, staggerItem } from '@/components/animations/variants';
import { useEffect, useRef, useState } from 'react';
import { useDrawLine } from '@/components/animations/GSAPWrapper';

export function ProblemSection() {
  const pains = [
    { icon: FileX2, title: 'LinkedIn owns your data', desc: 'Your professional identity lives on a platform that can delete it, gate it, or sell it.' },
    { icon: LinkIcon, title: 'IPFS pins expire', desc: 'Decentralized in name only — unpinned data vanishes when nobody pays to keep it alive.' },
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
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#00FF87" />
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
          <p className="mt-3 max-w-xl text-text-secondary">From your first commit to your latest role — all of it, verifiable.</p>
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
            return (
              <motion.div
                key={t}
                variants={staggerItem}
                whileHover={{ scale: 1.02 }}
                className="card-base card-hover group flex flex-col gap-3 p-6"
              >
                <span className="text-3xl">{meta.icon}</span>
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

const STATS = [
  { label: 'Credentials Issued', value: 12847 },
  { label: 'Verifications', value: 4291 },
  { label: 'Builders Registered', value: 3104 },
  { label: 'Organizations', value: 847 },
];

export function LiveStats() {
  return (
    <section className="py-section">
      <div className="container-x">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((s) => (
            <ScrollReveal key={s.label} className="text-center">
              <p className="text-gradient-accent text-4xl font-bold sm:text-5xl">
                <CounterAnimation target={s.value} />
              </p>
              <p className="mt-2 text-sm text-text-secondary">{s.label}</p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const BUILDERS = [
  { address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', name: 'alice.eth', skills: ['Solidity', 'Rust'], count: 14 },
  { address: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30', name: 'bobcodes', skills: ['React', 'GraphQL'], count: 9 },
  { address: '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E', name: 'satoshi', skills: ['Go', 'P2P'], count: 21 },
  { address: '0xdD870fA1b7C4700F2BD7f44238821C26f7392148', name: 'carol.eth', skills: ['Design', 'Figma'], count: 7 },
  { address: '0x8ba1f109551bd432803012645ac136c22c501e5a', name: 'devops_dan', skills: ['K8s', 'AWS'], count: 12 },
  { address: '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2', name: 'mira', skills: ['ML', 'Python'], count: 16 },
];

export function FeaturedBuilders() {
  return (
    <section className="border-y border-border bg-surface py-section">
      <div className="container-x">
        <ScrollReveal>
          <h2 className="heading-section">Featured builders</h2>
        </ScrollReveal>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BUILDERS.map((b, i) => (
            <ScrollReveal key={b.name} delay={i * 0.06}>
              <Link href={`/profile/${b.address}`} className="card-base card-hover group flex items-center gap-4 p-5">
                <Avatar address={b.address} size={52} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{b.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {b.skills.map((s) => (
                      <Chip key={s}>{s}</Chip>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="mono text-lg font-bold">{b.count}</p>
                  <p className="text-xs text-muted">creds</p>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const QUERY_RESULTS = ['alice.eth · 14 credentials', 'satoshi · 21 credentials', 'mira · 16 credentials'];

export function EmployerSection() {
  const [typed, setTyped] = useState('');
  const [showResults, setShowResults] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const target = 'Solidity developer 3+ years';

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
              setTimeout(() => setShowResults(true), 400);
            }
          }, 55);
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
          <h2 className="heading-section">Find verified talent instantly.</h2>
          <p className="mt-4 max-w-md text-text-secondary">
            Search by skill, role, or organization. Every result is backed by cryptographic
            proof — no more taking resumes on faith.
          </p>
          <Link href="/explore" className="mt-6 inline-block">
            <MagneticButton className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-white hover:bg-primary-hover">
              Search Builders <ArrowRight size={16} />
            </MagneticButton>
          </Link>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="card-base p-6">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3">
              <Search size={18} className="text-muted" />
              <span className="text-sm text-text-primary">
                {typed}
                <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary align-middle" />
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {QUERY_RESULTS.map((r, i) => (
                <motion.div
                  key={r}
                  initial={{ opacity: 0, x: 20 }}
                  animate={showResults ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: i * 0.15 }}
                  className="flex items-center gap-3 rounded-lg border border-border bg-white/[0.02] px-4 py-3"
                >
                  <span className="h-2 w-2 rounded-full bg-secondary" />
                  <span className="text-sm">{r}</span>
                </motion.div>
              ))}
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
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/10" />
      <div className="container-x relative text-center">
        <ScrollReveal>
          <h2 className="heading-section mx-auto max-w-2xl">Start building your on-chain reputation.</h2>
          <Link href="/dashboard" className="mt-8 inline-block">
            <MagneticButton className="inline-flex h-14 items-center gap-2 rounded-lg bg-primary px-10 text-base font-medium text-white shadow-[0_0_40px_-6px_rgba(79,70,229,0.8)] hover:bg-primary-hover">
              Get Started <ArrowRight size={18} />
            </MagneticButton>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
