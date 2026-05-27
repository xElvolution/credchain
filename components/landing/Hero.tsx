'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ParticleField } from '@/components/animations/ParticleField';
import { TextSplit } from '@/components/animations/TextSplit';
import { MagneticButton } from '@/components/animations/MagneticButton';
import { TypeBadge } from '@/components/ui/Badge';

const FLOAT_CARDS = [
  { type: 'HACKATHON' as const, title: 'Built MIRRO on Arc', org: 'Agora Agents', delay: 0 },
  { type: 'WORK' as const, title: 'Senior Engineer', org: 'Acme Corp', delay: 0.6 },
  { type: 'SKILL' as const, title: 'Solidity', org: 'Expert · 5y', delay: 1.2 },
];

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-mesh" />
      <ParticleField />

      <div className="container-x relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-text-secondary backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            Built on Arkiv Braga
          </motion.div>

          <h1 className="heading-fluid">
            <TextSplit as="span" text="Your Credentials." className="block text-text-primary" />
            <TextSplit
              as="span"
              text="On-Chain. Forever."
              className="block text-gradient-accent"
              delay={0.5}
            />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary"
          >
            The professional credential database owned by builders, not platforms.
            Store your work history on Arkiv Braga. Verifiable entities. Share it forever.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Link href="/dashboard">
              <MagneticButton className="inline-flex h-14 items-center gap-2 rounded-lg bg-primary px-8 text-base font-medium text-white shadow-[0_0_32px_-6px_rgba(79,70,229,0.7)] transition-colors hover:bg-primary-hover">
                Publish Your First Credential <ArrowRight size={18} />
              </MagneticButton>
            </Link>
            <Link href="/explore">
              <MagneticButton className="inline-flex h-14 items-center gap-2 rounded-lg border border-border-bright bg-transparent px-8 text-base font-medium text-text-primary transition-colors hover:border-primary hover:bg-primary-muted">
                Explore Builders
              </MagneticButton>
            </Link>
          </motion.div>
        </div>

        <div className="relative hidden h-[420px] lg:block">
          {FLOAT_CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + i * 0.15, duration: 0.6 }}
              style={{ top: `${i * 130}px`, right: `${i * 28}px` }}
              className="absolute w-72 animate-float"
            >
              <div
                className="card-base p-5"
                style={{ animationDelay: `${card.delay}s` }}
              >
                <TypeBadge type={card.type} />
                <h3 className="mt-3 text-base font-semibold">{card.title}</h3>
                <p className="text-sm text-text-secondary">{card.org}</p>
                <div className="mono mt-3 flex items-center gap-1 text-xs text-secondary">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" /> Verified on-chain
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted">
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          Scroll to explore
        </motion.div>
      </div>
    </section>
  );
}
