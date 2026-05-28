'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ensureGSAP } from '@/components/animations/GSAPWrapper';

interface ReputationRingProps {
  score: number;
  max?: number;
  size?: number;
}

export function ReputationRing({ score, max = 1000, size = 180 }: ReputationRingProps) {
  const circleRef = useRef<SVGCircleElement | null>(null);
  const numRef = useRef<HTMLSpanElement | null>(null);
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(1, score / max);

  useEffect(() => {
    ensureGSAP();
    const circle = circleRef.current;
    const num = numRef.current;
    if (!circle) return;
    gsap.set(circle, { strokeDashoffset: circumference });
    gsap.to(circle, {
      strokeDashoffset: circumference * (1 - pct),
      duration: 1.6,
      ease: 'power3.out',
    });
    if (num) {
      const obj = { v: 0 };
      gsap.to(obj, {
        v: score,
        duration: 1.6,
        ease: 'power2.out',
        onUpdate: () => {
          num.textContent = Math.floor(obj.v).toString();
        },
      });
    }
  }, [score, pct, circumference]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#ffffff10" strokeWidth={stroke} />
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#repGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
        />
        <defs>
          <linearGradient id="repGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span ref={numRef} className="mono text-3xl font-bold">
          0
        </span>
        <span className="text-xs text-muted">/ {max}</span>
      </div>
    </div>
  );
}

export function ProfileStats({ credentials, verifications }: { credentials: number; verifications: number }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card-base p-4 text-center">
        <p className="mono text-2xl font-bold">{credentials}</p>
        <p className="text-xs text-muted">Credentials</p>
      </div>
      <div className="card-base p-4 text-center">
        <p className="mono text-2xl font-bold text-secondary">{verifications}</p>
        <p className="text-xs text-muted">Verifications</p>
      </div>
    </div>
  );
}
