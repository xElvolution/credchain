import Link from 'next/link';
import { Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-x py-16">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-sm font-black text-background">
                C
              </span>
              <span className="text-lg font-bold tracking-tight">CREDCHAIN</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              The professional credential database owned by builders, not platforms.
            </p>
            <p className="mt-4 text-xs text-muted">Built on Arkiv Braga</p>
          </div>

          <div className="grid grid-cols-2 gap-12 sm:grid-cols-3">
            <FooterCol
              title="Product"
              links={[
                { href: '/explore', label: 'Explore' },
                { href: '/dashboard', label: 'Dashboard' },
              ]}
            />
            <FooterCol
              title="Resources"
              links={[
                { href: '/', label: 'Docs' },
                { href: '/explore', label: 'Builders' },
              ]}
            />
            <div>
              <h4 className="text-sm font-semibold text-text-primary">Social</h4>
              <div className="mt-4 flex gap-3">
                <a
                  href="https://twitter.com"
                  className="rounded-lg border border-border p-2 text-text-secondary transition-colors hover:border-primary hover:text-text-primary"
                  aria-label="Twitter"
                >
                  <Twitter size={16} />
                </a>
                <a
                  href="https://github.com"
                  className="rounded-lg border border-border p-2 text-text-secondary transition-colors hover:border-primary hover:text-text-primary"
                  aria-label="GitHub"
                >
                  <Github size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-xs text-muted">
          © {new Date().getFullYear()} CREDCHAIN. Your credentials. On-chain. Forever.
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-sm text-text-secondary transition-colors hover:text-text-primary">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
