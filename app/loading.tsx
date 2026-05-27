export default function Loading() {
  return (
    <div className="container-x flex min-h-screen items-center justify-center pt-24">
      <div className="flex items-center gap-3 text-text-secondary">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm">Loading…</span>
      </div>
    </div>
  );
}
