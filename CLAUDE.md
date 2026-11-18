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

## The context graph and the notes

Irma's notes on every irmahs.dev app are in her Obsidian notes, the repo irmahs/my-obsidian-notes (checked out at `~/Dev/my-obsidian-notes`), under `Self Hosted/`.

- Before starting work, read `Self Hosted/Context Graph.md` from that repo's `origin/main`: how irmahs.dev and every subdomain fit together (the proxy, the account service, which app talks to which, where each keeps its data). Without a checkout, read it with `gh api repos/irmahs/my-obsidian-notes/contents/Self%20Hosted/Context%20Graph.md -H "Accept: application/vnd.github.raw"`.
- When a change alters what the app is or does, update the notes too:
  - `Apps.md`, the app's section;
  - `Technologies.md`, if it adds, removes or changes a technology;
  - `Context Graph.md`, if it changes a subdomain, a redirect, a link between apps, who asks whom (sign-in, admin checks, internal calls), or where data lives. Update both the graph and the table.
- The notes go in through their own pull request, like any other change: a branch from the notes repo's `origin/main`, never their `main`. The local checkout is often left on an old branch, so work in a `git worktree` of `origin/main` rather than touching it. Link the app's PR in the notes PR.

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

**What it keeps, and no more** (irmahs.dev/privacy, in irmahs-labs/landing-page `src/lib/legal.ts`, promises it): a person's name, email, Google picture link and Google account id, and their signed-in browsers. `databaseHooks` in `src/auth.ts` empty a session's `ipAddress` and `userAgent` and an account's Google tokens before they are saved; the IP is only read in memory for rate limits. Anyone can delete their account from the sign-in page (`user.deleteUser`, which Better Auth allows from a session less than a day old). `src/sweep.ts` deletes, every day, the accounts nobody has used for two years (the CNIL's recommendation). The page's fonts are served from `public/fonts`, never from Google. Keeping anything more about people means updating the privacy policy in the same change.

`GET /api/access/:app` is Caddy's `forward_auth` target for private apps (in irmahs-labs/proxy): 302 to the sign-in page when signed out, 204 with `X-Auth-User-Id` and `X-Auth-User-Email` when the visitor's Google-verified email is listed for the app, 403 otherwise. Who may open each private app is in the `APP_ACCESS` secret (`.env.example` shows the format).

## Database

- The schema is the dbmate migrations in `db/migrations/`; `db/schema.sql` is dumped from them. Never edit a migration that is already merged: add a new one with `npm run db:new -- <name>`, with a matching `-- migrate:down`.
- After upgrading Better Auth or adding a plugin, run `npm run db:up && npm run db:schema`; any SQL it prints goes in a new migration.
- CI fails when Better Auth expects tables or columns the migrations do not create.

## Security

- Changes to `src/access.ts`, `src/app-access.ts` and `src/origins.ts` must keep or extend the tests in `src/access.test.ts`.
- It fails closed: an app missing from `APP_ACCESS` lets nobody in, and a malformed entry stops the service from starting.
