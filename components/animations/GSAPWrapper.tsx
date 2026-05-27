'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

export function ensureGSAP() {
  if (typeof window === 'undefined') return;
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
}

export function useScrollReveal<T extends HTMLElement>(
  options: { y?: number; delay?: number; duration?: number; once?: boolean; start?: string } = {}
) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    ensureGSAP();
    const el = ref.current;
    if (!el) return;
    const { y = 30, delay = 0, duration = 0.8, start = 'top 85%', once = true } = options;
    gsap.set(el, { y, opacity: 0 });
    const trigger = ScrollTrigger.create({
      trigger: el,
      start,
      once,
      onEnter: () => {
        gsap.to(el, { y: 0, opacity: 1, duration, delay, ease: 'power3.out' });
      },
    });
    return () => trigger.kill();
  }, [options]);
  return ref;
}

export function useCounterAnimation(
  target: number,
  options: { duration?: number; start?: string } = {}
) {
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    ensureGSAP();
    const el = ref.current;
    if (!el) return;
    const { duration = 2, start = 'top 85%' } = options;
    const obj = { val: 0 };
    el.textContent = '0';
    const trigger = ScrollTrigger.create({
      trigger: el,
      start,
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration,
          ease: 'power2.out',
          onUpdate: () => {
            if (el) el.textContent = Math.floor(obj.val).toLocaleString();
          },
        });
      },
    });
    return () => trigger.kill();
  }, [target, options]);
  return ref;
}

export function useDrawLine() {
  const ref = useRef<SVGPathElement | null>(null);
  useEffect(() => {
    ensureGSAP();
    const el = ref.current;
    if (!el) return;
    const length = el.getTotalLength?.() || 1000;
    gsap.set(el, { strokeDasharray: length, strokeDashoffset: length });
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      end: 'bottom 30%',
      scrub: 1,
      onUpdate: (self) => {
        gsap.set(el, { strokeDashoffset: length * (1 - self.progress) });
      },
    });
    return () => trigger.kill();
  }, []);
  return ref;
}
