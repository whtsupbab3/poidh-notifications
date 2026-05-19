# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start with hot reload (tsx watch)
pnpm build        # Compile TypeScript to dist/
pnpm start        # Run compiled output
pnpm lint         # ESLint
pnpm format       # Prettier
pnpm test         # Vitest (run all tests)
pnpm test <file>  # Run a single test file
```

## Environment

Requires a `.env` file with:
- `DATABASE_URL` — PostgreSQL connection string
- `NEYNAR_API_KEY` — Farcaster notification delivery
- `PORT` — HTTP server port (default 3000)

## Architecture

This is a **notification polling service** for the POIDH bounty platform. It has two concurrent responsibilities:

1. **HTTP server** (Hono) — exposes `/health` and `/api/echo` endpoints
2. **Polling loop** — runs every 5 seconds, fetches unsent notifications from the DB, and delivers them via Neynar (Farcaster)

### Data flow

The DB table `Notifications` stores pre-written notification events with `send_at = null`. The poller calls `getRecentActivity()` to fetch rows from the last 5 minutes where `send_at` is null, then dispatches each to the appropriate processor in `src/utils/notifications.ts`. After delivery, `send_at` is stamped.

### Event types

There are 11 event types defined as a Zod discriminated union in `src/utils/types.ts`: `BountyCreated`, `BountyJoined`, `ClaimCreated`, `ClaimAccepted`, `VotingStarted`, `VotingResolved`, `CommentCreated`, `ReplyCreated`, `WithdrawFromOpenBounty`, `Withdrawal`, `WithdrawalTo`. All are stored as JSONB in the `data` column and validated at runtime with Zod.

### Notification delivery

`src/utils/notifications.ts` contains one `process*` function per event type. Each resolves addresses to Farcaster FIDs via Neynar, then sends frame notifications. Neynar calls retry up to 3 times. The Neynar API utility lives in `src/utils/utils.ts`.

### Multi-chain support

Chains (Degen `666666666`, Arbitrum `42161`, Base `8453`, Mainnet `1`) are configured in `src/utils/config.ts`. Use `getChainById()` to resolve a chain ID to its name, slug, and currency.

## Code conventions

- TypeScript strict mode; no `any`
- Zod discriminated unions for all event types — add new events to the union in `types.ts` first, then add a processor
- Database access through the `getDb()` singleton (`src/db.ts`)
- Single quotes, semicolons, trailing commas (es5), 100-char line width (Prettier)
- Async/await throughout; no `.then()` chains
