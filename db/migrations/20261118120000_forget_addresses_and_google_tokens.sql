-- migrate:up
-- The service no longer keeps a signed-in browser's IP address or user
-- agent, nor the tokens Google hands back (src/auth.ts, irmahs.dev/privacy).
-- This clears what was kept before. The columns stay: Better Auth expects
-- them, and they are always empty now.
update "session" set "ipAddress" = null, "userAgent" = null;

update "account"
set "accessToken" = null,
    "accessTokenExpiresAt" = null,
    "idToken" = null,
    "refreshToken" = null,
    "refreshTokenExpiresAt" = null;

-- migrate:down
-- What was cleared cannot be brought back.
select 1;
