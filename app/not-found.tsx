import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="container-x flex min-h-screen items-center justify-center pt-24">
      <Card hover={false} className="max-w-md text-center">
        <p className="mono text-sm text-muted">404</p>
        <h1 className="mt-2 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-text-secondary">
          That URL doesn't lead anywhere on CREDCHAIN.
        </p>
        <Link href="/" className="mt-6 inline-block">
          <Button>Go home</Button>
        </Link>
      </Card>
    </div>
  );
}
