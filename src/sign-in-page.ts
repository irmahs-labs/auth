// The one page this service shows: "Sign in to IrmaHS Labs". An app sends
// people here with ?redirect=<where to come back to>; signing in with Google
// sets a session cookie for every *.irmahs.dev app and returns them there.

// Safe inside a <script> block: JSON with "<" escaped cannot close the tag.
function scriptJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function signInPage(redirect: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Sign in · IrmaHS Labs</title>
<style>
  :root { --bg: #f4f1ea; --card: #fff; --ink: #1f2a22; --muted: #5d6b60; --line: #d9d4c7; --accent: #2f5d3a; }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #151a16; --card: #1e2520; --ink: #e8ece8; --muted: #a3b0a6; --line: #34403a; --accent: #8fc79b; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 16px;
         background: var(--bg); color: var(--ink); font: 16px/1.5 system-ui, sans-serif; }
  main { width: 100%; max-width: 360px; background: var(--card); border: 1px solid var(--line);
         border-radius: 12px; padding: 32px 24px; text-align: center; }
  h1 { margin: 0 0 4px; font-size: 1.4rem; }
  p { margin: 0 0 24px; color: var(--muted); }
  button, a.button { display: block; width: 100%; padding: 12px; border-radius: 8px; font: inherit;
         cursor: pointer; text-decoration: none; border: 1px solid var(--line);
         background: var(--card); color: var(--ink); margin-top: 8px; }
  button.primary, a.primary { background: var(--accent); border-color: var(--accent); color: var(--card); }
  .error { color: #b3261e; }
  [hidden] { display: none !important; }
</style>
</head>
<body>
<main>
  <h1>IrmaHS Labs</h1>
  <p id="lead">One account for every app.</p>
  <p id="error" class="error" hidden>That did not work. Please try again.</p>
  <div id="signed-out" hidden>
    <button id="google" class="primary" type="button">Continue with Google</button>
  </div>
  <div id="signed-in" hidden>
    <a id="continue" class="button primary" href="#">Continue</a>
    <button id="sign-out" type="button">Sign out</button>
  </div>
</main>
<script>
  const redirect = ${scriptJson(redirect)};
  const $ = (id) => document.getElementById(id);
  const here = new URL(location.href);
  if (here.searchParams.has("error")) $("error").hidden = false;

  async function api(path, body) {
    const response = await fetch("/api/auth" + path, body === undefined
      ? { credentials: "include" }
      : { method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    return response.ok ? response.json() : null;
  }

  $("google").addEventListener("click", async () => {
    $("google").disabled = true;
    const back = new URL("/sign-in", location.origin);
    back.searchParams.set("redirect", redirect);
    const result = await api("/sign-in/social", { provider: "google", callbackURL: redirect, errorCallbackURL: back.href });
    if (result && result.url) location.href = result.url;
    else { $("error").hidden = false; $("google").disabled = false; }
  });

  $("sign-out").addEventListener("click", async () => {
    await api("/sign-out", {});
    location.reload();
  });

  api("/get-session").then((session) => {
    if (session && session.user) {
      $("lead").textContent = "Signed in as " + (session.user.email || session.user.name);
      $("continue").href = redirect;
      $("signed-in").hidden = false;
    } else {
      $("signed-out").hidden = false;
    }
  });
</script>
</body>
</html>
`;
}
