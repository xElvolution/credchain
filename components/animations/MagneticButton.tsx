'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
}

export function MagneticButton({
  children,
  className = '',
  strength = 8,
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });

    function onMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      const max = strength;
      xTo(Math.max(-max, Math.min(max, relX * 0.4)));
      yTo(Math.max(-max, Math.min(max, relY * 0.4)));
    }
    function onLeave() {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    }

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [strength]);

  return (
    <button ref={ref} className={className} onClick={onClick}>
      {children}
    </button>
  );
}
