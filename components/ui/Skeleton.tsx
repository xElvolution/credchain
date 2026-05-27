import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-white/[0.04]',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer',
        'before:bg-gradient-to-r before:from-transparent before:via-white/[0.06] before:to-transparent',
        className
      )}
    />
  );
}

export function CredentialCardSkeleton() {
  return (
    <div className="card-base space-y-4 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-12" />
      </div>
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="card-base space-y-4 p-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
}
