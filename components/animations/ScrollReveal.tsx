'use client';

import { type ReactNode } from 'react';
import { useScrollReveal } from './GSAPWrapper';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right';
  distance?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'header';
}

export function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  distance = 30,
  className = '',
  as: Tag = 'div',
}: ScrollRevealProps) {
  const y = direction === 'up' ? distance : 0;
  const ref = useScrollReveal<HTMLDivElement>({ y, delay });
  return (
    <Tag ref={ref as any} className={className}>
      {children}
    </Tag>
  );
}
