# auth

One account for every irmahs.dev app, at **https://auth.irmahs.dev**. People sign in once with Google, and the session cookie is shared by every `*.irmahs.dev` subdomain, so each app knows who they are without a sign-in of its own.

Built on [Better Auth](https://www.better-auth.com/) and [Hono](https://hono.dev/), with its own Postgres database. Google is the only way in: there are no passwords to store, reset or leak.

```
browser ──▶ app.irmahs.dev ──"who is this?"──▶ auth:3001/api/auth/get-session ──▶ accounts db
   │                                                    ▲
   └──── not signed in: auth.irmahs.dev/sign-in ──Google──┘  (cookie set for .irmahs.dev)
```

## Using it from an app

1. **Not signed in?** Send the browser to the sign-in page with where to come back to:
   ```
   https://auth.irmahs.dev/sign-in?redirect=https://sleepy-spinner.irmahs.dev/
   ```
   Only `https://irmahs.dev` and `https://<one-label>.irmahs.dev` are accepted; anything else lands on the sign-in page itself.
2. **Who is signed in?** From the app's own server, forward the browser's `Cookie` header:
   ```
   GET http://auth:3001/api/auth/get-session        (over the shared proxy network)
   ```
   It answers `null`, or `{ "user": { "id", "name", "email", "image", … }, "session": { … } }`. Store `user.id` (a UUID) against the app's own rows, in the app's own database.
3. **Sign out**: `POST https://auth.irmahs.dev/api/auth/sign-out` from the browser with `credentials: "include"`, or send people to the sign-in page, which has a Sign out button.

An app never talks to Google and never sees the client secret.

## Local development

Needs Node 22+ and Docker.

```bash
cp .env.example .env     # then fill in BETTER_AUTH_SECRET and the Google client
npm install
npm run db:up            # Postgres on localhost:5433, migrations applied
npm run dev              # http://localhost:3001/sign-in
```

`.env` is ignored by git. Locally there is no `COOKIE_DOMAIN`: every port on `localhost` already shares cookies, so an app on `localhost:5173` sees the session from `localhost:3001`.

## Google

Google Cloud project **irmahs-hub** → Google Auth Platform → Clients → the web client. Its redirect URIs are this service's only:

```
http://localhost:3001/api/auth/callback/google
https://auth.irmahs.dev/api/auth/callback/google
```

Adding an app never changes this list. While the audience is **Testing**, only the test users listed there can sign in.

## Database

`db/migrations/` holds the schema, applied by [dbmate](https://github.com/amacneil/dbmate). After upgrading Better Auth or adding a plugin, check whether it needs new columns:

```bash
npm run db:up && npm run db:schema
```

If it prints SQL, put it in a new migration (`npm run db:new -- <name>`) with a matching `-- migrate:down`. CI fails while Better Auth expects anything the migrations do not create.

## Deploying

Pushing to `main` deploys to `/srv/auth` on the server: Postgres starts, pending migrations run, then the service is rebuilt and started on the `proxy` network as `auth`. The proxy repo routes `auth.irmahs.dev` to it.

Secrets (Settings → Secrets and variables → Actions):

| Secret | What |
| --- | --- |
| `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`, `DEPLOY_HOST` | Organization level, shared with the other repos |
| `AUTH_POSTGRES_PASSWORD` | The accounts database's password. Read only when the database is first created |
| `BETTER_AUTH_SECRET` | Signs session cookies. `openssl rand -base64 32`; changing it signs everyone out |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | From the Google client above |

The production settings that are not secret (`AUTH_URL`, `TRUSTED_ORIGINS`, `COOKIE_DOMAIN`) are in `compose.prod.yaml`.
