'use client';

import { type HTMLAttributes, forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padded?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = true, padded = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'card-base',
          hover && 'card-hover',
          padded && 'p-6',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export function MotionCard({ className, children, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn('card-base card-hover p-6', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
