# CREDCHAIN

**Your credentials. On-chain. Forever.**

Submission for the [Arkiv Web3 Database Builder Challenge](https://ns.com/earn/web3-database-builder-challenge) — **Job Board** vertical.

CREDCHAIN is a Web3-native professional credential platform. Builder profiles, work history, skills, and peer endorsements are stored as **Arkiv entities on Braga testnet**. Anyone can browse and verify credentials without connecting a wallet.

---

## Submission

| Requirement | Details |
|-------------|---------|
| **Theme** | DePIN + Privacy hybrid |
| **GitHub repo** | [github.com/xElvolution/credchain](https://github.com/xElvolution/credchain) — public, open source, MIT `LICENSE` |
| **Demo link** | _[add Vercel URL]_ |
| **Demo video** | _[add link]_ — optional at submission; required for prize claim (2–3 min) |
| **Team** | **Ebuzoaju Elvis** · GitHub [@xElvolution](https://github.com/xElvolution) · Prize wallet: _[add 0x address]_ |
| **Submit at** | [forms.arkiv.network/ethns-arkiv-challenge](https://forms.arkiv.network/ethns-arkiv-challenge) |

---

## What this solves

LinkedIn-style platforms own your professional data. CREDCHAIN inverts that: credentials are **Arkiv entities** with wallet-attributed ownership, public verification, and no platform lock-in.

**Browse without a wallet.** Connect only to publish or endorse.

---

## Challenge requirements

Built against the [Builder's Guide](https://github.com/Arkiv-Network/arkiv-web3-database-builders-challenge/blob/main/docs/builders-guide.md) Job Board vertical and technical baseline.

| Requirement | Implementation |
|-------------|----------------|
| Core data on Arkiv | Profiles, credentials, skill tags, and verifications written via `@arkiv-network/sdk` on Braga |
| Wallet-based ownership | `$owner` and `$creator` metadata on every entity; `ownerAddress` attribute links data to the builder's wallet |
| ≥ 2 entity types + relationships | Four types with parent→child references (see below) |
| Queryable attributes | `entityType`, `project`, `ownerAddress`, `skill`, `credentialType` — used in Arkiv queries and mirrored in the explore index |
| Expiration dates | `expiresIn` set per entity (default 365 days, configurable) |
| Public read access | `/explore`, `/profile/[address]`, `/verify/[credentialId]` — no wallet required |
| Braga testnet | All writes and reads go through Braga RPC |

### Job Board features

| Feature | Route |
|---------|-------|
| Browse builder profiles | `/explore` |
| Search & filter (keyword, skills, verified, reputation) | `/explore` |
| View profile & credentials | `/profile/[address]` |
| Publish credentials (wallet required) | `/dashboard` |
| Public proof page (entity key, `$owner`, `$creator`, tx) | `/verify/[credentialId]` |
| Peer endorsement (wallet required) | Verify flow on credential pages |

---

## Arkiv integration

### Project attribute

Every entity create and query includes:

```
{ key: "project", value: "credchain-arkiv-hackathon-v1" }
```

Defined in `lib/arkiv/constants.ts`.

### Entity types

| Type | Purpose |
|------|---------|
| `profile` | Builder identity (one per wallet) |
| `credential` | Work, project, skill, education, hackathon, etc. |
| `credentialSkill` | Tag/skill linked to a credential |
| `verification` | Peer endorsement of a credential |

### Entity graph

```
profile
  └── credential
        ├── credentialSkill (per tag)
        └── verification (per endorser)
```

Relationships use shared attribute keys: `profileEntityKey`, `credentialEntityKey`.

### Entity structure

Each entity includes:

- **Payload** — JSON (`application/json`)
- **Attributes** — indexed fields for querying (`entityType`, `ownerAddress`, etc.)
- **`expiresIn`** — TTL via `ExpirationTime.fromDays()`
- **`$owner`** — mutable; controls updates
- **`$creator`** — immutable attribution

Core implementation: `lib/arkiv/service.ts`

### On-chain proof

Braga supports **Arkiv entity transactions only** (no custom Solidity). Verification is:

1. Open `/verify/[credentialId]`
2. Confirm **Arkiv entity key**, **Braga tx hash**, **`$owner`**, **`$creator`**
3. Follow links to the [Braga entity explorer](https://explorer.braga.hoodi.arkiv.network/entity/)

---

## Demo walkthrough

Suggested path for evaluation (~3 min):

1. **`/explore`** — browse profiles without connecting a wallet; try keyword search and skill filters.
2. **`/dashboard`** — connect wallet (Privy, Braga chain); publish a credential.
3. **Success screen** — copy the entity key; open the Braga explorer link.
4. **`/verify/[credentialId]`** — confirm on-chain proof fields.
5. **`/profile/[address]`** — view the builder's full credential wall.
6. **Endorsement** — second wallet verifies a credential; a `verification` entity is created on Arkiv.

---

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Browser   │────▶│  Next.js API     │────▶│  Arkiv (Braga)  │
│   Privy     │     │  @arkiv-network/ │     │  entity store   │
│   auth      │     │  sdk             │     │  (source of     │
└─────────────┘     └────────┬─────────┘     │   truth)        │
                             │               └─────────────────┘
                             ▼
                    ┌──────────────────┐
                    │ Supabase Postgres│
                    │ (search index)   │
                    └──────────────────┘
```

| Layer | Role |
|-------|------|
| **Arkiv / Braga** | Canonical credential data — profiles, credentials, skills, verifications |
| **Supabase Postgres** | Read-optimized index for search and UI (not the verification source of truth) |
| **Supabase Storage** | Avatar images |
| **Privy** | Wallet authentication on Braga |

Entity writes are executed server-side through the Arkiv SDK. The connected user's wallet address is recorded in entity metadata and attributes.

---

## Running locally

```bash
pnpm install
cp .env.example .env.local   # configure env vars
pnpm prisma:generate
pnpm prisma:push
pnpm dev                      # http://localhost:3000
```

See `.env.example` for required variables.

Braga GLM faucet: [braga.hoodi.arkiv.network/faucet](https://braga.hoodi.arkiv.network/faucet/)

---

## Deploying on Vercel

Add **all** of these in Vercel → Project → Settings → Environment Variables (Production + Preview):

| Variable | Required | Notes |
|----------|----------|-------|
| `ARKIV_PRIVATE_KEY` | **yes** | Server wallet — signs Braga entity txs; fund with GLM |
| `ARKIV_RPC_URL` | yes | `https://braga.hoodi.arkiv.network/rpc` |
| `NEXT_PUBLIC_ARKIV_RPC_URL` | yes | Same Braga RPC (browser / Privy) |
| `ARKIV_EXPIRY_DAYS` | no | Default `365` |
| `NEXT_PUBLIC_ARKIV_EXPLORER` | yes | `https://explorer.braga.hoodi.arkiv.network/entity/` |
| `NEXT_PUBLIC_BRAGA_TX_EXPLORER` | yes | `https://explorer.braga.hoodi.arkiv.network/tx/` |
| `NEXT_PUBLIC_PRIVY_APP_ID` | yes | From [dashboard.privy.io](https://dashboard.privy.io) |
| `PRIVY_APP_SECRET` | yes | Server-side Privy auth |
| `DATABASE_URL` | yes | Supabase pooler URL (port **6543**, `?pgbouncer=true`) |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Avatar uploads |
| `SUPABASE_AVATAR_BUCKET` | yes | `avatars` |
| `NEXTAUTH_SECRET` | yes | Random string for session cookies |

**Build command:** `pnpm prisma:generate && pnpm build` (or use the default `pnpm build` in this repo).

---

## Project structure

```
lib/arkiv/          Arkiv SDK integration (entities, queries, proof)
app/api/credentials Create, verify, proof endpoints
app/explore/        Public browse & search
app/verify/         On-chain proof page
app/dashboard/      Publish credentials
```
