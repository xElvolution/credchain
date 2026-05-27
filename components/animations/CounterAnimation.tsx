'use client';

import { useCounterAnimation } from './GSAPWrapper';

interface CounterAnimationProps {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CounterAnimation({
  target,
  duration = 2,
  prefix = '',
  suffix = '',
  className = '',
}: CounterAnimationProps) {
  const ref = useCounterAnimation(target, { duration });
  return (
    <span className={`mono ${className}`}>
      {prefix}
      <span ref={ref}>0</span>
      {suffix}
    </span>
  );
}
