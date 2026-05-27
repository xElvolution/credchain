'use client';

import { gradientFromAddress, cn } from '@/lib/utils';

interface AvatarProps {
  address: string;
  src?: string | null;
  size?: number;
  className?: string;
}

export function Avatar({ address, src, size = 40, className }: AvatarProps) {
  const initials = address ? address.slice(2, 4).toUpperCase() : '??';
  return (
    <div
      className={cn('relative flex shrink-0 items-center justify-center overflow-hidden rounded-full', className)}
      style={{ width: size, height: size, background: gradientFromAddress(address) }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="avatar" className="h-full w-full object-cover" />
      ) : (
        <span
          className="mono font-semibold text-white/90"
          style={{ fontSize: size * 0.32 }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
