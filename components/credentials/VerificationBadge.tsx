'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { truncateAddress, formatDate } from '@/lib/utils';

interface VerificationBadgeProps {
  verifierAddress: string;
  date?: string;
}

export function VerificationBadge({ verifierAddress, date }: VerificationBadgeProps) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <Tooltip
      content={
        <span className="mono">
          {verifierAddress}
          {date ? ` · ${formatDate(date)}` : ''}
        </span>
      }
    >
      <span className="inline-flex items-center gap-1 rounded-full border border-secondary/30 bg-secondary-muted px-2 py-0.5 text-xs font-medium text-secondary">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: shown ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          <Check size={11} strokeWidth={3} />
        </motion.span>
        {truncateAddress(verifierAddress)}
      </span>
    </Tooltip>
  );
}
