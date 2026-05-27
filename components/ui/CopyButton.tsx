'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import toast from 'react-hot-toast';

export function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async (e) => {
        e.stopPropagation();
        e.preventDefault();
        try {
          await copyToClipboard(value);
          setCopied(true);
          toast.success(label ? `${label} copied` : 'Copied');
          setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error('Copy failed');
        }
      }}
      className="inline-flex items-center rounded p-1 text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
      aria-label="Copy to clipboard"
    >
      {copied ? <Check size={13} className="text-secondary" /> : <Copy size={13} />}
    </button>
  );
}
