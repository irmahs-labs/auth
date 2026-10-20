import { Hono } from "hono";

import { noAccessPage } from "./no-access-page.js";
import { originOf } from "./origins.js";

// The part of a Better Auth session this check reads.
export type Visitor = {
  user: { email: string; emailVerified: boolean; id: string };
} | null;

export type AccessOptions = {
  // Private apps and who may open them (APP_ACCESS).
  appAccess: Map<string, Set<string>>;
  // The sign-in page, where the visitor is sent to sign in and back.
  fallback: string;
  // Who is asking, from the cookie Caddy passes on.
  getVisitor: (headers: Headers) => Promise<Visitor>;
  isTrusted: (origin: string) => boolean;
};

// Private apps. Caddy asks here before every request to one (forward_auth in
// irmahs-labs/proxy), passing on the visitor's cookie and where they were
// going. A 2xx lets the request through, with who it is in X-Auth-User-*;
// anything else Caddy sends back to the visitor as it is.
export const accessRoutes = ({
  appAccess,
  fallback,
  getVisitor,
  isTrusted,
}: AccessOptions) =>
  new Hono().get("/api/access/:app", async (c) => {
    const host = c.req.header("x-forwarded-host") ?? "";
    const going = `https://${host}${c.req.header("x-forwarded-uri") ?? "/"}`;
    const back = isTrusted(originOf(going) ?? "") ? going : fallback;
    const signIn = `${fallback}?redirect=${encodeURIComponent(back)}`;

    const visitor = await getVisitor(c.req.raw.headers);
    if (!visitor) {
      return c.redirect(signIn);
    }
    const email = visitor.user.email.toLowerCase();
    const allowed = appAccess.get(c.req.param("app"));
    if (!visitor.user.emailVerified || !allowed?.has(email)) {
      return c.html(noAccessPage(email, signIn), 403);
    }
    c.header("x-auth-user-id", visitor.user.id);
    c.header("x-auth-user-email", email);
    return c.body(null, 204);
  });
