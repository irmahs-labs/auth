import { describe, expect, it } from "vitest";

import { accessRoutes } from "./access.js";
import type { Visitor } from "./access.js";
import { parseAppAccess } from "./app-access.js";
import { originMatcher } from "./origins.js";

const fallback = "https://auth.irmahs.dev/sign-in";

const visitor = (email: string, emailVerified = true): Visitor => ({
  user: { email, emailVerified, id: "user-1" },
});

// The access check as Caddy calls it, for a visitor who has signed in as
// `who` (or nobody), on their way to https://<host><uri>.
const ask = (
  app: string,
  who: Visitor,
  { host = "alma-housila.irmahs.dev", uri = "/" } = {}
) =>
  accessRoutes({
    appAccess: parseAppAccess(
      "alma-housila=irma.houversing@gmail.com,friend@gmail.com;other=someone@gmail.com"
    ),
    fallback,
    getVisitor: () => Promise.resolve(who),
    isTrusted: originMatcher(["https://*.irmahs.dev"]),
  }).request(`/api/access/${app}`, {
    headers: { "x-forwarded-host": host, "x-forwarded-uri": uri },
  });

describe("GET /api/access/:app", () => {
  it("lets in an email listed for the app, and says who it is", async () => {
    const res = await ask("alma-housila", visitor("friend@gmail.com"));
    expect(res.status).toBe(204);
    expect(res.headers.get("x-auth-user-id")).toBe("user-1");
    expect(res.headers.get("x-auth-user-email")).toBe("friend@gmail.com");
  });

  it("ignores capitals in the visitor's email", async () => {
    const res = await ask("alma-housila", visitor("Irma.Houversing@Gmail.com"));
    expect(res.status).toBe(204);
    expect(res.headers.get("x-auth-user-email")).toBe(
      "irma.houversing@gmail.com"
    );
  });

  it("shows an email that is not listed the private page", async () => {
    const res = await ask("alma-housila", visitor("stranger@gmail.com"));
    expect(res.status).toBe(403);
    expect(await res.text()).toContain("This app is private");
    expect(res.headers.get("x-auth-user-email")).toBeNull();
  });

  it("turns away a listed email Google has not verified", async () => {
    const res = await ask("alma-housila", visitor("friend@gmail.com", false));
    expect(res.status).toBe(403);
  });

  it("does not let an email listed for one app into another", async () => {
    const res = await ask("other", visitor("irma.houversing@gmail.com"));
    expect(res.status).toBe(403);
  });

  it("lets nobody into an app missing from APP_ACCESS", async () => {
    const res = await ask("unknown-app", visitor("irma.houversing@gmail.com"));
    expect(res.status).toBe(403);
  });

  it("sends someone signed out to sign in, then back where they were going", async () => {
    const res = await ask("alma-housila", null, { uri: "/chapter?n=2" });
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(
      `${fallback}?redirect=${encodeURIComponent("https://alma-housila.irmahs.dev/chapter?n=2")}`
    );
  });

  it("never sends someone back to a host it does not trust", async () => {
    const res = await ask("alma-housila", null, { host: "evil.example" });
    expect(res.headers.get("location")).toBe(
      `${fallback}?redirect=${encodeURIComponent(fallback)}`
    );
  });
});

describe("APP_ACCESS", () => {
  it("reads each app's emails, trimmed and in lowercase", () => {
    const access = parseAppAccess(
      " alma-housila = Irma@Gmail.com , friend@gmail.com ;other=a@b.c;"
    );

    expect([...access.keys()]).toEqual(["alma-housila", "other"]);
    expect([...(access.get("alma-housila") ?? [])]).toEqual([
      "irma@gmail.com",
      "friend@gmail.com",
    ]);
  });

  it("is empty when unset, so no private app lets anyone in", () => {
    expect(parseAppAccess("").size).toBe(0);
  });

  it.each([
    "alma-housila",
    "alma-housila=",
    "alma-housila= , ",
    "=irma@gmail.com",
    "Alma Housila=irma@gmail.com",
    "alma_housila=irma@gmail.com",
  ])("refuses to start with a bad entry: %j", (value) => {
    expect(() => parseAppAccess(value)).toThrow("APP_ACCESS has a bad entry");
  });
});

describe("trusted origins", () => {
  const isTrusted = originMatcher([
    "https://irmahs.dev",
    "https://*.irmahs.dev",
  ]);

  it("trusts the site and one level of subdomain", () => {
    expect(isTrusted("https://irmahs.dev")).toBe(true);
    expect(isTrusted("https://alma-housila.irmahs.dev")).toBe(true);
  });

  it.each([
    "http://alma-housila.irmahs.dev",
    "https://a.b.irmahs.dev",
    "https://irmahs.dev.evil.example",
    "https://evilirmahs.dev",
    "https://irmahsXdev",
    "",
  ])("does not trust %j", (origin) => {
    expect(isTrusted(origin)).toBe(false);
  });
});
