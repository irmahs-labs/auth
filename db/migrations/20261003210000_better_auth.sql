-- migrate:up
-- Better Auth's four tables, as `npm run db:schema` printed them for
-- better-auth 1.7 with uuid ids. Apps keep their own data in their own
-- databases and store "user".id against it; nothing outside this database
-- references these tables directly.

-- One row per person, whichever apps they use.
create table "user" (
  "id" uuid default pg_catalog.gen_random_uuid() not null primary key,
  "name" text not null,
  "email" text not null unique,
  "emailVerified" boolean not null,
  "image" text,
  "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
  "updatedAt" timestamptz default CURRENT_TIMESTAMP not null
);

-- A signed-in browser. The cookie carries the token; signing out deletes the row.
create table "session" (
  "id" uuid default pg_catalog.gen_random_uuid() not null primary key,
  "expiresAt" timestamptz not null,
  "token" text not null unique,
  "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
  "updatedAt" timestamptz not null,
  "ipAddress" text,
  "userAgent" text,
  "userId" uuid not null references "user" ("id") on delete cascade
);

-- How a person signs in: here, their Google account. "password" stays empty,
-- since there is no email-and-password sign-in.
create table "account" (
  "id" uuid default pg_catalog.gen_random_uuid() not null primary key,
  "accountId" text not null,
  "providerId" text not null,
  "userId" uuid not null references "user" ("id") on delete cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  "scope" text,
  "password" text,
  "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
  "updatedAt" timestamptz not null
);

-- Short-lived values, such as the state that protects the Google round trip.
create table "verification" (
  "id" uuid default pg_catalog.gen_random_uuid() not null primary key,
  "identifier" text not null,
  "value" text not null,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
  "updatedAt" timestamptz default CURRENT_TIMESTAMP not null
);

create index "session_userId_idx" on "session" ("userId");
create index "account_userId_idx" on "account" ("userId");
create index "verification_identifier_idx" on "verification" ("identifier");


-- migrate:down

drop table "verification";
drop table "account";
drop table "session";
drop table "user";
