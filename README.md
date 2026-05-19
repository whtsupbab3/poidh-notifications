# poidh-notifications

Notification polling service for the [POIDH](https://poidh.xyz) bounty platform. Delivers Farcaster frame notifications to users when bounty activity occurs.

## How it works

The service runs two things concurrently:

- **HTTP server** (Hono) — exposes `/health` and `/api/echo`
- **Polling loop** — runs every 5 seconds, fetches unsent rows from the `Notifications` table, delivers them via Neynar, then stamps `send_at`

Notifications are pre-written into the DB by the main POIDH backend. This service is purely responsible for delivery.

## Event types

| Event | Who gets notified |
|---|---|
| `BountyCreated` | Broadcast (bounties ≥ $100 only) |
| `BountyJoined` | Bounty participants; broadcast when pool crosses $100 |
| `ClaimCreated` | Bounty participants |
| `ClaimAccepted` | Claim creator |
| `VotingStarted` | Nominated claimer, bounty participants, other claimers |
| `VotingResolved` | Claim creator (win or veto) |
| `CommentCreated` | Addresses tagged in the comment |
| `ReplyCreated` | Addresses tagged in the reply |

## Supported chains

| Chain | ID |
|---|---|
| Ethereum Mainnet | `1` |
| Arbitrum One | `42161` |
| Base | `8453` |
| Degen Mainnet | `666666666` |

## Setup

```bash
cp .env.example .env   # fill in values below
pnpm install
```

**.env** variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEYNAR_API_KEY` | Neynar API key for Farcaster delivery |
| `PORT` | HTTP server port (default: `3000`) |

## Commands

```bash
pnpm dev      # Start with hot reload
pnpm build    # Compile TypeScript to dist/
pnpm start    # Run compiled output
pnpm test     # Run tests
pnpm lint     # ESLint
pnpm format   # Prettier
```

## Project structure

```
src/
  index.ts              # Entry point: HTTP server + polling loop
  db.ts                 # Drizzle ORM singleton
  db-schema.ts          # Notifications table schema
  utils/
    types.ts            # Zod discriminated union for all event payloads
    notifications.ts    # One process* function per event type
    utils.ts            # Neynar API helpers (getFarcasterFids, getRecentActivity)
    config.ts           # Chain config and getChainById()
```

## Adding a new event type

1. Add the event schema and type to `src/utils/types.ts` (discriminated union)
2. Add a `process*` function in `src/utils/notifications.ts`
3. Wire it into the polling loop in `src/index.ts`

## License

MIT
