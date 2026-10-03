import { betterAuth } from "better-auth";
import pg from "pg";
import { env } from "./env.js";

// One account for every irmahs.dev app. Google is the only way in, so there
// are no passwords to store, reset or leak.
export const auth = betterAuth({
  appName: "IrmaHS Labs",
  baseURL: env.authUrl,
  secret: env.secret,
  database: new pg.Pool({ connectionString: env.databaseUrl }),
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
  advanced: {
    // Apps store this id against their own rows, in their own databases.
    database: { generateId: "uuid" },
    cookiePrefix: "irmahs",
    crossSubDomainCookies: env.cookieDomain
      ? { enabled: true, domain: env.cookieDomain }
      : undefined,
    // Caddy puts the visitor's address here; without it every request would
    // look like it came from the proxy, and rate limits would be shared.
    ipAddress: { ipAddressHeaders: ["x-forwarded-for"] },
  },
});
