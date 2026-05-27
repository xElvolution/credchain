'use client';

import { useEnsName } from 'wagmi';
import { Globe, Share2 } from 'lucide-react';
import { GithubIcon as Github, TwitterIcon as Twitter } from '@/components/ui/BrandIcons';
import type { UserProfile } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { CopyButton } from '@/components/ui/CopyButton';
import { Button } from '@/components/ui/Button';
import { truncateAddress, copyToClipboard } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwner: boolean;
  onVerify?: () => void;
}

export function ProfileHeader({ profile, isOwner, onVerify }: ProfileHeaderProps) {
  const { data: ensName } = useEnsName({ address: profile.address as `0x${string}` });
  const credCount = profile.credentials.length;
  const verifCount = profile.credentials.reduce(
    (s, c) => s + ((c as any).verifications?.length ?? 0),
    0
  );

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
      <Avatar address={profile.address} src={profile.avatar} size={96} className="ring-2 ring-border-bright" />

      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {profile.username || ensName || truncateAddress(profile.address, 6)}
          </h1>
          {ensName && profile.username && (
            <span className="mono text-sm text-secondary">{ensName}</span>
          )}
        </div>

        <div className="mono mt-1 flex items-center gap-1 text-sm text-text-secondary">
          {truncateAddress(profile.address, 6)}
          <CopyButton value={profile.address} label="Address" />
        </div>

        {profile.bio && <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-secondary">{profile.bio}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary">
              <Globe size={14} /> Website
            </a>
          )}
          {profile.twitter && (
            <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary">
              <Twitter size={14} /> {profile.twitter}
            </a>
          )}
          {profile.github && (
            <a href={`https://github.com/${profile.github}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary">
              <Github size={14} /> {profile.github}
            </a>
          )}
        </div>

        <div className="mt-5 flex items-center gap-6">
          <Stat label="Credentials" value={credCount} />
          <Stat label="Verifications" value={verifCount} />
          <Stat label="Score" value={profile.reputationScore ?? 0} />
        </div>
      </div>

      <div className="flex gap-2">
        {!isOwner && onVerify && (
          <Button onClick={onVerify} size="sm">
            Verify a Credential
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await copyToClipboard(window.location.href);
            toast.success('Profile link copied');
          }}
        >
          <Share2 size={14} /> Share
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="mono text-xl font-bold">{value.toLocaleString()}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
