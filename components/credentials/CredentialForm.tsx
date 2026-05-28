'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, ExternalLink } from 'lucide-react';
import { CREDENTIAL_TYPES, CREDENTIAL_TYPE_META, type CredentialType, type Credential } from '@/types';
import { CREDENTIAL_TYPE_ICON } from '@/lib/credential-icons';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn, bragaTxUrl, truncateHash } from '@/lib/utils';
import toast from 'react-hot-toast';

type Stage = 'idle' | 'publishing' | 'linking' | 'done';

interface FieldDef {
  name: string;
  label: string;
  type?: 'text' | 'date' | 'url' | 'textarea';
  placeholder?: string;
}

const FIELDS: Record<CredentialType, FieldDef[]> = {
  WORK: [
    { name: 'title', label: 'Role / Title', placeholder: 'Senior Engineer' },
    { name: 'organization', label: 'Company', placeholder: 'Acme Corp' },
    { name: 'startDate', label: 'Start date', type: 'date' },
    { name: 'endDate', label: 'End date', type: 'date' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'What you did' },
    { name: 'url', label: 'URL', type: 'url', placeholder: 'https://' },
  ],
  PROJECT: [
    { name: 'title', label: 'Project name', placeholder: 'MIRRO' },
    { name: 'organization', label: 'Built at / for', placeholder: 'Personal' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'url', label: 'GitHub URL', type: 'url', placeholder: 'https://github.com/...' },
  ],
  SKILL: [
    { name: 'title', label: 'Skill', placeholder: 'Solidity' },
    { name: 'organization', label: 'Proficiency', placeholder: 'Expert' },
    { name: 'description', label: 'Years of experience / notes', type: 'textarea' },
  ],
  EDUCATION: [
    { name: 'title', label: 'Degree / Program', placeholder: 'BSc Computer Science' },
    { name: 'organization', label: 'Institution', placeholder: 'MIT' },
    { name: 'startDate', label: 'Start', type: 'date' },
    { name: 'endDate', label: 'End', type: 'date' },
    { name: 'description', label: 'Field / details', type: 'textarea' },
  ],
  HACKATHON: [
    { name: 'title', label: 'Project / Prize', placeholder: 'Built MIRRO on Arc' },
    { name: 'organization', label: 'Hackathon', placeholder: 'Agora Agents Hackathon' },
    { name: 'description', label: 'Details', type: 'textarea' },
    { name: 'url', label: 'Project URL', type: 'url' },
  ],
  CERTIFICATION: [
    { name: 'title', label: 'Certification', placeholder: 'AWS Solutions Architect' },
    { name: 'organization', label: 'Issuer', placeholder: 'Amazon' },
    { name: 'startDate', label: 'Issued', type: 'date' },
    { name: 'url', label: 'Verification URL', type: 'url' },
  ],
  CONTRIBUTION: [
    { name: 'title', label: 'Contribution', placeholder: 'Fixed memory leak in core' },
    { name: 'organization', label: 'Repository', placeholder: 'ethereum/go-ethereum' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'url', label: 'Merged PR URL', type: 'url' },
  ],
};

interface CredentialFormProps {
  onCreated: (c: Credential) => void;
}

export function CredentialForm({ onCreated }: CredentialFormProps) {
  const [type, setType] = useState<CredentialType>('HACKATHON');
  const [values, setValues] = useState<Record<string, string>>({});
  const [tagsInput, setTagsInput] = useState('');
  const [stage, setStage] = useState<Stage>('idle');
  const [result, setResult] = useState<Credential | null>(null);

  const fields = FIELDS[type];

  function set(name: string, v: string) {
    setValues((prev) => ({ ...prev, [name]: v }));
  }

  async function submit() {
    if (!values.title?.trim() || !values.organization?.trim()) {
      toast.error('Title and organization are required');
      return;
    }
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    setStage('publishing');
    const payload: Record<string, unknown> = {
      type,
      title: values.title.trim(),
      organization: values.organization.trim(),
      description: values.description?.trim() || undefined,
      url: values.url?.trim() || undefined,
      tags,
    };
    if (values.startDate) payload.startDate = new Date(values.startDate).toISOString();
    if (values.endDate) payload.endDate = new Date(values.endDate).toISOString();

    try {
      const reqPromise = fetch('/api/credentials/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await new Promise((r) => setTimeout(r, 700));
      setStage('linking');
      const res = await reqPromise;
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.formErrors?.[0] || json.error || 'Failed');
      }
      setStage('done');
      setResult(json.credential);
      onCreated(json.credential);
      toast.success('Credential published on-chain');
    } catch (err: any) {
      setStage('idle');
      toast.error(typeof err?.message === 'string' ? err.message : 'Failed to publish');
    }
  }

  function reset() {
    setValues({});
    setTagsInput('');
    setStage('idle');
    setResult(null);
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {CREDENTIAL_TYPES.map((t) => {
          const Icon = CREDENTIAL_TYPE_ICON[t];
          return (
          <button
            key={t}
            onClick={() => setType(t)}
            disabled={stage !== 'idle'}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-200',
              type === t
                ? 'border-primary bg-primary-muted text-text-primary'
                : 'border-border text-text-secondary hover:border-border-bright hover:text-text-primary'
            )}
          >
            <Icon size={14} className={type === t ? 'text-primary' : 'text-text-secondary'} />
            {CREDENTIAL_TYPE_META[t].label.split(' ')[0]}
          </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {stage === 'idle' && (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {fields.map((f) => (
              <div key={f.name} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                {f.type === 'textarea' ? (
                  <Textarea
                    label={f.label}
                    placeholder={f.placeholder}
                    value={values[f.name] || ''}
                    onChange={(e) => set(f.name, e.target.value)}
                  />
                ) : (
                  <Input
                    label={f.label}
                    type={f.type === 'date' ? 'date' : f.type === 'url' ? 'url' : 'text'}
                    placeholder={f.placeholder}
                    value={values[f.name] || ''}
                    onChange={(e) => set(f.name, e.target.value)}
                  />
                )}
              </div>
            ))}
            <div className="sm:col-span-2">
              <Input
                label="Tags (comma separated)"
                placeholder="DeFi, TypeScript, Arc, Circle"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Button onClick={submit} size="lg" className="w-full">
                Publish to Arkiv
              </Button>
            </div>
          </motion.div>
        )}

        {(stage === 'publishing' || stage === 'linking') && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4 py-8"
          >
            <StageRow active={stage === 'publishing'} done={stage !== 'publishing'} label="Creating entities on Arkiv Braga…" />
            <StageRow active={stage === 'linking'} done={false} label="Linking skill relationship entities…" />
          </motion.div>
        )}

        {stage === 'done' && result && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 py-8 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary-muted">
              <Check className="text-secondary" size={32} strokeWidth={3} />
            </div>
            <div>
              <p className="text-lg font-semibold">Credential published</p>
              <p className="mono mt-1 text-sm text-text-secondary">{truncateHash(result.arkivEntityKey || '', 14, 8)}</p>
            </div>
            {result.txHash && (
              <a
                href={bragaTxUrl(result.txHash)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:opacity-80"
              >
                View on Braga Explorer <ExternalLink size={14} />
              </a>
            )}
            <Button variant="ghost" onClick={reset}>
              Add another
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StageRow({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      {done ? (
        <Check className="text-secondary" size={20} strokeWidth={3} />
      ) : active ? (
        <Loader2 className="animate-spin text-primary" size={20} />
      ) : (
        <div className="h-5 w-5 rounded-full border border-border" />
      )}
      <span className={cn('text-sm', done || active ? 'text-text-primary' : 'text-muted')}>{label}</span>
    </div>
  );
}
