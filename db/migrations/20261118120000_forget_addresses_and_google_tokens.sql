-- migrate:up
-- The service no longer keeps a signed-in browser's IP address or user
-- agent, nor the tokens Google hands back (src/auth.ts, irmahs.dev/privacy).
-- This clears what was kept before. The columns stay: Better Auth expects
-- them, and they are always empty now.
update "session"
set "ipAddress" = null, "userAgent" = null
where "ipAddress" is not null or "userAgent" is not null;

update "account"
set "accessToken" = null,
    "accessTokenExpiresAt" = null,
    "idToken" = null,
    "refreshToken" = null,
    "refreshTokenExpiresAt" = null
where "accessToken" is not null
   or "accessTokenExpiresAt" is not null
   or "idToken" is not null
   or "refreshToken" is not null
   or "refreshTokenExpiresAt" is not null;

-- migrate:down
-- What was cleared cannot be brought back.
select 1;
