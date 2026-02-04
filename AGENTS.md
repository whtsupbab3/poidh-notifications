# AGENTS.md

This file is for agentic coding helpers working in this repo.
Keep changes small, follow existing patterns, and respect local tooling.

## Project Summary

- Node.js + TypeScript service for POIDH notifications.
- Runtime entry: `src/index.ts`.
- HTTP server: Hono on Node.
- Database: Postgres via drizzle-orm.
- Validation/types: Zod schemas in `src/utils/types.ts`.

## Quick Start

- Install deps: `pnpm install`
- Run dev watcher: `pnpm run dev`
- Build: `pnpm run build`
- Start built app: `pnpm run start`

## Build, Lint, Format, Test

- Build: `pnpm run build` (tsc, output to `dist/`)
- Lint: `pnpm run lint` (eslint over `src/`)
- Format: `pnpm run format` (prettier write)
- Test: `pnpm run test` (vitest run)
- Watch tests: `pnpm run test:watch`

### Run a Single Test

- By file: `pnpm exec vitest run src/path/to/file.test.ts`
- By name: `pnpm exec vitest run -t "test name"`
- File + name: `pnpm exec vitest run src/path/to/file.test.ts -t "test name"`
- Watch single: `pnpm exec vitest watch src/path/to/file.test.ts -t "test name"`

## Environment Variables

- `DATABASE_URL`: Postgres connection string (required for DB access).
- `NEYNAR_API_KEY`: required for Neynar API calls.
- `PORT`: HTTP port (defaults to 3000).

## Repo Layout

- `src/index.ts`: app entry, polling loop, routes.
- `src/utils/`: notification logic, config, helper utilities.
- `src/utils/types.ts`: Zod schemas + TS types.
- `src/db.ts`: database connection singleton.
- `src/db-schema.ts`: Drizzle table schema.
- `dist/`: compiled output (ignored by eslint).

## Code Style (Observed)

- Language: TypeScript (strict mode).
- Quotes: single quotes.
- Semicolons: used.
- Trailing commas: used where appropriate (Prettier).
- Line width: follow Prettier defaults.
- Prefer `const` and `let` over `var`.
- Use `async/await` for async flows.

## Imports

- Use ES module syntax (`import ... from ...`).
- Prefer absolute package imports before relative imports.
- Group imports logically (external, internal).
- Avoid unused imports (eslint: recommended + TS).

## Types and Validation

- Define schemas with Zod and export inferred types.
- Keep core data shapes in `src/utils/types.ts`.
- Use discriminated unions for event payloads.
- Narrow types with `Extract<...>` when handling specific events.
- Use template literal types for on-chain addresses.

## Naming Conventions

- Files: `kebab-case.ts` or `camelCase.ts` (existing uses `utils.ts`, `db-schema.ts`).
- Types: `PascalCase` (e.g., `NotificationEventPayload`).
- Functions: `camelCase` (e.g., `processBountyCreated`).
- Constants: `UPPER_SNAKE_CASE` for env-like values.
- Database columns: snake_case in schema definitions.

## Error Handling

- Use `try/catch` around I/O and network calls.
- Log errors with `console.error` when continuing.
- Prefer returning safe defaults on failure (`[]`, `{}`, `null`).
- Throw early when a required env var is missing.
- Avoid swallowing errors silently.

## Data Flow Expectations

- Poll recent activity in `src/index.ts`.
- Transform DB rows into typed payloads with Zod parsing.
- Notification dispatch is retried (3 attempts) with logging.
- Update `send_at` after processing a notification.

## Formatting

- Prettier is the canonical formatter (`pnpm run format`).
- ESLint enforces TypeScript rules + Prettier integration.
- Avoid manual formatting deviations; let Prettier handle it.

## Testing Notes

- Tests use Vitest with node environment.
- Globals enabled in Vitest config.
- Favor small, focused tests; mock external APIs.

## Database Notes

- Drizzle uses Postgres-js driver.
- `getDb()` is a singleton to avoid multiple clients.
- Keep schemas in `src/db-schema.ts`.

## Dependency Expectations

- Node >= 18.
- Ensure `dotenv/config` import runs early when needed.

## Cursor/Copilot Rules

- No `.cursor/rules`, `.cursorrules`, or `.github/copilot-instructions.md` found in this repo.

## Agent Workflow Tips

- Read relevant files before editing.
- Match existing style and conventions.
- Update types and schemas together when changing payload shapes.
- If adding scripts, document them here.
