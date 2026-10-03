// Every setting the service reads, checked once at startup so a missing value
// fails the deploy loudly instead of the first sign-in quietly.

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set; see .env.example`);
  }
  return value;
}

function list(name: string): string[] {
  return required(name)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export const env = {
  // Where this service is reached from a browser: https://auth.irmahs.dev.
  authUrl: required("AUTH_URL"),
  secret: required("BETTER_AUTH_SECRET"),
  databaseUrl: required("DATABASE_URL"),
  googleClientId: required("GOOGLE_CLIENT_ID"),
  googleClientSecret: required("GOOGLE_CLIENT_SECRET"),
  // Origins allowed to call this service and to be sent back to after
  // signing in. `*` matches one subdomain label: https://*.irmahs.dev.
  trustedOrigins: list("TRUSTED_ORIGINS"),
  // Set in production to share the session across subdomains: irmahs.dev.
  // Left empty locally, where every port on localhost already shares cookies.
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  port: Number(process.env.PORT ?? 3001),
};
