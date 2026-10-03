import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { auth } from "./auth.js";
import { env } from "./env.js";
import { originMatcher, originOf } from "./origins.js";
import { signInPage } from "./sign-in-page.js";

const isTrusted = originMatcher(env.trustedOrigins);
// Where someone lands with no ?redirect, or with one we will not send them to.
const fallback = new URL("/sign-in", env.authUrl).href;

const app = new Hono();

// Apps on other subdomains call the API from the browser with their cookie,
// so CORS has to name the origin exactly and allow credentials.
app.use(
  "/api/auth/*",
  cors({
    allowHeaders: ["content-type"],
    allowMethods: ["GET", "POST"],
    credentials: true,
    maxAge: 600,
    origin: (origin) => (isTrusted(origin) ? origin : null),
  })
);
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/sign-in", (c) => {
  const requested = c.req.query("redirect") ?? "";
  const origin = originOf(requested);
  const redirect =
    origin && (isTrusted(origin) || origin === new URL(env.authUrl).origin)
      ? requested
      : fallback;
  return c.html(signInPage(redirect));
});

app.get("/", (c) => c.redirect("/sign-in"));
app.get("/healthz", (c) => c.text("ok"));

serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.log(`auth listening on :${info.port} as ${env.authUrl}`);
});
