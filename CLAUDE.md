# CLAUDE.md

## Git branches

Always pull before making changes: run `git fetch origin` and start from the latest `origin/main` before the first edit.

- On a branch whose PR is open, bring it up to date with `origin/main` first
- On `main`, or on a branch whose PR is already merged, create a new branch from `origin/main` instead

Always name the branch after the feature or fix it contains, never a random or generated name.

- Format: `<type>/<feature-name>` in lowercase kebab-case
- Types: `feat`, `fix`, `chore`, `docs`, `refactor`
- Examples: `feat/magic-link`, `fix/redirect-check`, `docs/claude-md`
- If the session assigns a generic branch (for example `claude/<random-words>`), create a feature-named branch instead and push there

## Pull requests

- Never push to `main`. Every change goes in through a pull request.
- Open the PR and stop there: never merge it, not even when CI is green. Irma reviews and clicks merge.
- Deploys run on merge to `main`. Re-run a deploy only when Irma asks.

## Checks before pushing

```sh
npm run check      # Ultracite (oxlint + oxfmt); CI fails on it
npm run typecheck
npm test           # vitest
npm run build
```

The PostToolUse hook in `.claude/hooks/ultracite.sh` runs Ultracite and the typecheck on every file you edit.

## What this is

The one Google sign-in for every irmahs.dev app, at auth.irmahs.dev: Better Auth on Hono, with its own Postgres database. Google is the only way in, so there are no passwords. The session cookie is shared on `*.irmahs.dev` (`COOKIE_DOMAIN` in production), so an app learns who is signed in by forwarding the browser's cookie to `/api/auth/get-session`.

`GET /api/access/:app` is Caddy's `forward_auth` target for private apps (in irmahs-labs/proxy): 302 to the sign-in page when signed out, 204 with `X-Auth-User-Id` and `X-Auth-User-Email` when the visitor's Google-verified email is listed for the app, 403 otherwise. Who may open each private app is in the `APP_ACCESS` secret (`.env.example` shows the format).

## Database

- The schema is the dbmate migrations in `db/migrations/`; `db/schema.sql` is dumped from them. Never edit a migration that is already merged: add a new one with `npm run db:new -- <name>`, with a matching `-- migrate:down`.
- After upgrading Better Auth or adding a plugin, run `npm run db:up && npm run db:schema`; any SQL it prints goes in a new migration.
- CI fails when Better Auth expects tables or columns the migrations do not create.

## Security

- Changes to `src/access.ts`, `src/app-access.ts` and `src/origins.ts` must keep or extend the tests in `src/access.test.ts`.
- It fails closed: an app missing from `APP_ACCESS` lets nobody in, and a malformed entry stops the service from starting.
