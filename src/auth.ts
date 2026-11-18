import { betterAuth } from "better-auth";
import { Pool } from "pg";

import { env } from "./env.js";

export const pool = new Pool({ connectionString: env.databaseUrl });

// What Google hands back that no app uses: they are never kept, so the
// account row holds only who the person is (see irmahs.dev/privacy).
const NO_TOKENS = {
  accessToken: null,
  accessTokenExpiresAt: null,
  idToken: null,
  refreshToken: null,
  refreshTokenExpiresAt: null,
};

// One account for every irmahs.dev app. Google is the only way in, so there
// are no passwords to store, reset or leak.
export const auth = betterAuth({
  advanced: {
    cookiePrefix: "irmahs",
    crossSubDomainCookies: env.cookieDomain
      ? { domain: env.cookieDomain, enabled: true }
      : undefined,
    // Apps store this id against their own rows, in their own databases.
    database: { generateId: "uuid" },
    // Caddy puts the visitor's address here; without it every request would
    // look like it came from the proxy, and rate limits would be shared. It
    // is only held in memory for the rate limits, never stored.
    ipAddress: { ipAddressHeaders: ["x-forwarded-for"] },
  },
  appName: "IrmaHS Labs",
  baseURL: env.authUrl,
  database: pool,
  // Only what the service needs is kept (irmahs.dev/privacy): a signed-in
  // browser without its address or user agent, and an account without
  // Google's tokens. Signing in marks the person as active, which the
  // inactive-account sweep reads (sweep.ts).
  databaseHooks: {
    account: {
      create: {
        before: (account) =>
          Promise.resolve({ data: { ...account, ...NO_TOKENS } }),
      },
      update: {
        before: (account) =>
          Promise.resolve({ data: { ...account, ...NO_TOKENS } }),
      },
    },
    session: {
      create: {
        after: async (session) => {
          await pool.query(
            'update "user" set "updatedAt" = now() where "id" = $1',
            [session.userId]
          );
        },
        before: (session) =>
          Promise.resolve({
            data: { ...session, ipAddress: null, userAgent: null },
          }),
      },
    },
  },
  secret: env.secret,
  socialProviders: {
    google: {
      clientId: env.googleClientId,
      clientSecret: env.googleClientSecret,
      // Always show the account chooser, so a shared computer cannot sign
      // the next person in as the last one.
      prompt: "select_account",
    },
  },
  trustedOrigins: env.trustedOrigins,
  // Anyone can delete their account from the sign-in page. Better Auth asks
  // for a session less than a day old, so the page asks to sign in again
  // first when it is older.
  user: { deleteUser: { enabled: true } },
});
