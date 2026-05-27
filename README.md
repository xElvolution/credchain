# CREDCHAIN

**Your credentials. On-chain. Forever.**

The professional credential database owned by builders, not platforms. All
permanent credential data lives as **Arkiv entities on Braga testnet**.

Built for the [Web3 Database Builder Challenge](https://ns.com/earn/web3-database-builder-challenge)
using **Next.js 14** + **@arkiv-network/sdk** + **Privy** + **Supabase** + **Prisma**.

---

## Quick start

```bash
pnpm install
cp .env.example .env.local
# Fill in Supabase + Privy + Arkiv keys (see below)

pnpm prisma:generate
pnpm prisma:push
pnpm dev
```

---

## One chain: Braga

| Layer | Where |
|-------|--------|
| Credential entities | **Arkiv SDK** on Braga |
| App index | **Supabase Postgres** |
| Avatars | **Supabase Storage** |

On Braga, credentials are **Arkiv entities** with `$owner`, `$creator`, entity keys, and relationship attributes — no custom Solidity contract required.

---

## Environment

| Variable | Required | Notes |
|---|---|---|
| `ARKIV_PRIVATE_KEY` | for Braga writes | Fund with GLM from faucet |
| `ARKIV_RPC_URL` | no | Default `https://braga.hoodi.arkiv.network/rpc` |
| `NEXT_PUBLIC_PRIVY_APP_ID` | yes | dashboard.privy.io |
| `PRIVY_APP_SECRET` | yes | Server auth |
| `DATABASE_URL` | yes | Supabase Transaction pooler (6543) |
| `DIRECT_URL` | yes | Supabase Session pooler (5432) |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | for avatars | Storage uploads |
| `NEXTAUTH_SECRET` | yes | Session cookie signing |

---

## Supabase setup

1. Create project at [supabase.com](https://supabase.com)
2. Copy **Database** connection strings → `DATABASE_URL` + `DIRECT_URL`
3. Copy **API** keys → `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
4. **Storage** → create public bucket `avatars`
5. `pnpm prisma:push`

---

## Arkiv entity model

```
profile → credential → credentialSkill (tags)
                    → verification (endorsements)
```

- `PROJECT_ATTRIBUTE` on every entity + query
- `$owner` / `$creator` in entity metadata
- Relationships via `profileEntityKey`, `credentialEntityKey`

See `lib/arkiv/` for implementation.

---

## Submission checklist

- [ ] Public GitHub repo
- [ ] Live demo URL
- [ ] `ARKIV_PRIVATE_KEY` funded on Braga
- [ ] Demo: publish credential → `/verify/[id]` shows entity key + $owner/$creator

---

## Design

- Background `#0A0A0F` · Primary `#4F46E5` · Secondary `#00FF87`
- Fonts: Inter + JetBrains Mono
