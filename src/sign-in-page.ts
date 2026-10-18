// The sign-in page: "Sign in to IrmaHS Labs". An app sends
// people here with ?redirect=<where to come back to>; signing in with Google
// sets a session cookie for every *.irmahs.dev app and returns them there.

import { page } from "./page.js";

// A string as a JavaScript literal that is safe inside a <script> block: with
// "<" escaped, it cannot close the tag.
const scriptString = (value: string): string =>
  JSON.stringify(value).replaceAll("<", "\\u003c");

export const signInPage = (redirect: string): string =>
  page(
    "Sign in · IrmaHS Labs",
    `    <h1>IrmaHS Labs</h1>
    <p id="lead">one account for every app</p>
    <p id="error" class="error" hidden>That did not work. Please try again.</p>
    <div id="signed-out" hidden>
      <button id="google" class="primary" type="button">
        <span class="g"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48">
          <path d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5z" fill="#FFC107"/>
          <path d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" fill="#FF3D00"/>
          <path d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" fill="#4CAF50"/>
          <path d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" fill="#1976D2"/>
        </svg></span>
        <span>continue with Google</span>
      </button>
    </div>
    <div id="signed-in" hidden>
      <a id="continue" class="button primary" href="#">continue</a>
      <button id="sign-out" type="button">sign out</button>
    </div>
`,
    `<script>
  const redirect = ${scriptString(redirect)};
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
`
  );
