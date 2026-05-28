'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ensureGSAP } from './GSAPWrapper';

interface TextSplitProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

/**
 * Free GSAP SplitText alternative - splits text into <span> chars
 * preserving whitespace, then staggers them in (y:40 → 0, opacity:0 → 1).
 * No paid Club GSAP plugin required.
 */
export function TextSplit({
  text,
  className = '',
  delay = 0,
  stagger = 0.02,
  as: Tag = 'span',
}: TextSplitProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    ensureGSAP();
    const el = ref.current;
    if (!el) return;
    const chars = el.querySelectorAll('.split-char');
    if (!chars.length) return;
    gsap.set(chars, { y: 40, opacity: 0 });
    gsap.to(chars, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger,
      delay,
      ease: 'power3.out',
    });
  }, [text, delay, stagger]);

  const chars = Array.from(text);

  return (
    <Tag ref={ref as any} className={className} aria-label={text}>
      {chars.map((ch, i) =>
        ch === ' ' ? (
          <span key={i} className="split-char" aria-hidden>
            &nbsp;
          </span>
        ) : (
          <span key={i} className="split-char" aria-hidden>
            {ch}
          </span>
        )
      )}
    </Tag>
  );
}
