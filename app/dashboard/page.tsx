'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutGrid, Plus, ShieldCheck, Settings, ExternalLink, Sparkles,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { CredentialGrid } from '@/components/credentials/CredentialGrid';
import { CredentialForm } from '@/components/credentials/CredentialForm';
import { CounterAnimation } from '@/components/animations/CounterAnimation';
import { useCredentials } from '@/hooks/useCredentials';
import { useProfile } from '@/hooks/useProfile';
import { useWallet } from '@/hooks/useWallet';
import { cn, truncateAddress } from '@/lib/utils';
import type { Credential } from '@/types';
import toast from 'react-hot-toast';

type Tab = 'credentials' | 'add' | 'verifications' | 'settings';

export default function DashboardPage() {
  const { address, isConnected, signIn, signingIn } = useWallet();
  const { credentials, loading, addCredential } = useCredentials(address);
  const { profile, updateProfile } = useProfile(address);
  const [tab, setTab] = useState<Tab>('credentials');

  const completion = useMemo(() => {
    if (!profile) return 0;
    const fields = [profile.username, profile.bio, profile.avatar, profile.website, profile.twitter, profile.github];
    const present = fields.filter(Boolean).length;
    const base = Math.round((present / fields.length) * 60);
    const credBoost = Math.min(40, credentials.length * 8);
    return Math.min(100, base + credBoost);
  }, [profile, credentials]);

  const verifications = credentials.reduce((s, c) => s + ((c as any).verifications?.length ?? 0), 0);
  const profileViews = 42 + credentials.length * 7;
  const reputation = Math.min(1000, credentials.length * 35 + verifications * 25);

  const suggestions: string[] = [];
  if (!profile?.username) suggestions.push('Pick a username');
  if (!profile?.bio) suggestions.push('Add a bio');
  if (credentials.length < 3) suggestions.push(`Add ${3 - credentials.length} more credential${3 - credentials.length === 1 ? '' : 's'}`);
  if (verifications === 0) suggestions.push('Request your first verification');

  if (!isConnected) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.07] blur-[120px]" />
          <div className="absolute left-1/3 top-1/3 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/[0.05] blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md"
        >
          <div className="rounded-2xl border border-border bg-card/80 p-8 backdrop-blur-xl sm:p-10">
            {/* Wallet icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
              </svg>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="mt-6 text-center"
            >
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                Connect your wallet
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                Your dashboard is gated by your wallet. The same key that opens it signs every credential you publish.
              </p>
            </motion.div>

            {/* Connect button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-8"
            >
              <Button
                size="lg"
                className="w-full text-base"
                onClick={signIn}
                loading={signingIn}
              >
                Connect Wallet
              </Button>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="mt-8 space-y-3"
            >
              {[
                { icon: ShieldCheck, text: 'Credentials signed by your wallet' },
                { icon: Sparkles, text: 'Stored as Arkiv entities on Braga' },
                { icon: ExternalLink, text: 'Publicly verifiable by anyone' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-text-secondary">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border-bright bg-white/[0.03]">
                    <Icon size={14} className="text-primary" />
                  </div>
                  {text}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Bottom hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-4 text-center text-xs text-text-secondary/60"
          >
            Powered by Privy. No seed phrase required.
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container-x grid gap-8 pt-24 pb-section lg:grid-cols-[240px_1fr]">
      <aside>
        <Card hover={false} className="sticky top-24 space-y-5" padded>
          <div className="flex items-center gap-3">
            <Avatar address={address!} src={profile?.avatar} size={44} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{profile?.username || 'Builder'}</p>
              <p className="mono text-xs text-text-secondary">{truncateAddress(address!)}</p>
            </div>
          </div>

          <nav className="space-y-1">
            <NavItem icon={LayoutGrid} active={tab === 'credentials'} onClick={() => setTab('credentials')}>My Credentials</NavItem>
            <NavItem icon={Plus} active={tab === 'add'} onClick={() => setTab('add')}>Add Credential</NavItem>
            <NavItem icon={ShieldCheck} active={tab === 'verifications'} onClick={() => setTab('verifications')}>Verifications</NavItem>
            <NavItem icon={Settings} active={tab === 'settings'} onClick={() => setTab('settings')}>Settings</NavItem>
          </nav>

          <Link
            href={`/profile/${address}`}
            className="flex items-center justify-between rounded-lg border border-border-bright bg-card px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-primary hover:text-text-primary"
          >
            My Profile <ExternalLink size={14} />
          </Link>

          <Button variant="ghost" size="sm" className="w-full" onClick={signIn} loading={signingIn}>
            Re-sign session
          </Button>
        </Card>
      </aside>

      <section className="space-y-8">
        <Card hover={false} className="relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-text-primary">
                <Sparkles size={15} className="text-secondary" />
                Your profile is {completion}% complete
              </p>
              {suggestions.length > 0 && (
                <p className="mt-1 text-xs text-text-secondary">{suggestions.join(' · ')}</p>
              )}
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.05]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completion}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-[#06B6D4]"
            />
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total Credentials" value={credentials.length} />
          <StatCard label="Verifications" value={verifications} />
          <StatCard label="Profile Views" value={profileViews} />
          <StatCard label="Reputation" value={reputation} />
        </div>

        {tab === 'credentials' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your credentials</h2>
              <Button size="sm" onClick={() => setTab('add')}>
                <Plus size={14} /> Add
              </Button>
            </div>
            <CredentialGrid credentials={credentials} loading={loading} />
          </div>
        )}

        {tab === 'add' && (
          <Card hover={false}>
            <h2 className="text-xl font-semibold">Add a credential</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Your credential is stored as Arkiv entities on Braga testnet.
            </p>
            <div className="mt-6">
              <CredentialForm
                onCreated={(c: Credential) => {
                  addCredential(c);
                  setTab('credentials');
                }}
              />
            </div>
          </Card>
        )}

        {tab === 'verifications' && (
          <Card hover={false}>
            <h2 className="text-xl font-semibold">Verifications received</h2>
            <p className="mt-2 text-sm text-text-secondary">
              {verifications === 0
                ? 'No verifications yet - share your credentials with collaborators who can endorse them.'
                : `${verifications} verification${verifications === 1 ? '' : 's'} across your credentials.`}
            </p>
          </Card>
        )}

        {tab === 'settings' && profile && (
          <SettingsPanel profile={profile} updateProfile={updateProfile} />
        )}
      </section>
    </div>
  );
}

function NavItem({
  icon: Icon, active, onClick, children,
}: { icon: any; active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-primary-muted text-text-primary'
          : 'text-text-secondary hover:bg-white/[0.04] hover:text-text-primary'
      )}
    >
      <Icon size={15} />
      {children}
    </button>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card hover={false} padded className="text-center">
      <p className="text-gradient-accent text-3xl font-bold">
        <CounterAnimation target={value} duration={1.4} />
      </p>
      <p className="mt-1 text-xs text-text-secondary">{label}</p>
    </Card>
  );
}

function SettingsPanel({
  profile, updateProfile,
}: { profile: any; updateProfile: (data: any) => Promise<any> }) {
  const [form, setForm] = useState({
    username: profile.username || '',
    bio: profile.bio || '',
    website: profile.website || '',
    twitter: profile.twitter || '',
    github: profile.github || '',
    avatar: profile.avatar || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function uploadAvatarFile(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/upload/avatar', { method: 'POST', body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      setForm((f) => ({ ...f, avatar: json.url }));
    } catch (err: any) {
      toast.error(err.message || 'Avatar upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      await updateProfile(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card hover={false}>
      <h2 className="text-xl font-semibold">Profile settings</h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <div>
          <Input label="Avatar URL" value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} />
          <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadAvatarFile(file);
                e.target.value = '';
              }}
            />
            <span className="rounded-lg border border-border px-3 py-1.5 transition-colors hover:border-white/20">
              {uploading ? 'Uploading...' : 'Upload image'}
            </span>
          </label>
        </div>
        <div className="sm:col-span-2">
          <Textarea label="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        <Input label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://" />
        <Input label="Twitter handle" value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} />
        <Input label="GitHub username" value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} />
      </div>
      <div className="mt-6">
        <Button onClick={save} loading={saving}>Save</Button>
      </div>
    </Card>
  );
}
