'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-x flex min-h-screen items-center justify-center pt-24">
      <Card hover={false} className="max-w-md text-center">
        <h1 className="text-2xl font-bold">Something broke</h1>
        <p className="mt-2 text-sm text-text-secondary">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={reset}>Try again</Button>
          <Link href="/">
            <Button variant="ghost">Go home</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
