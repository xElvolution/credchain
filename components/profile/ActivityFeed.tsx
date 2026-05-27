'use client';

import { motion } from 'framer-motion';
import { FilePlus2, ShieldCheck } from 'lucide-react';
import type { Credential, Verification } from '@/types';
import { feedItem } from '@/components/animations/variants';
import { truncateAddress, formatDate } from '@/lib/utils';

interface ActivityItem {
  id: string;
  kind: 'added' | 'verified';
  text: string;
  date: string;
}

export function ActivityFeed({
  credentials,
  verifications,
}: {
  credentials: Credential[];
  verifications?: Verification[];
}) {
  const items: ActivityItem[] = [];

  for (const c of credentials.slice(0, 8)) {
    items.push({
      id: `c-${c.id}`,
      kind: 'added',
      text: `Added credential: ${c.title}`,
      date: c.createdAt,
    });
  }
  for (const v of verifications?.slice(0, 8) ?? []) {
    items.push({
      id: `v-${v.id}`,
      kind: 'verified',
      text: `Received verification from ${truncateAddress(v.verifier?.address || '')}`,
      date: v.createdAt,
    });
  }

  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (!items.length) {
    return <p className="text-sm text-muted">No recent activity.</p>;
  }

  return (
    <div className="space-y-3">
      {items.slice(0, 10).map((item, i) => (
        <motion.div
          key={item.id}
          variants={feedItem}
          initial="hidden"
          animate="visible"
          transition={{ delay: i * 0.05 }}
          className="flex items-start gap-3 rounded-lg border border-border bg-white/[0.02] p-3"
        >
          <div
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
              item.kind === 'added' ? 'bg-primary-muted text-primary' : 'bg-secondary-muted text-secondary'
            }`}
          >
            {item.kind === 'added' ? <FilePlus2 size={14} /> : <ShieldCheck size={14} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-text-primary">{item.text}</p>
            <p className="mono text-xs text-muted">{formatDate(item.date)}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
