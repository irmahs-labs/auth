// The one page this service shows: "Sign in to IrmaHS Labs". An app sends
// people here with ?redirect=<where to come back to>; signing in with Google
// sets a session cookie for every *.irmahs.dev app and returns them there.

// A string as a JavaScript literal that is safe inside a <script> block: with
// "<" escaped, it cannot close the tag.
const scriptString = (value: string): string =>
  JSON.stringify(value).replaceAll("<", "\\u003c");

export const signInPage = (redirect: string): string => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Sign in · IrmaHS Labs</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600&display=swap">
<style>
  /* Cute Matcha, the same tokens as the landing page at irmahs.dev. There is
     no dark theme: the system has none. */
  :root {
    --ground: #f3f1c8; --surface: #dde87e; --paper: #f7f8de; --white: #fff;
    --ink: #2f3b34; --bark: #3b4a42; --bark-grid: #4e6152; --cream: #fff3cf;
    --surface-alt: #b8d970; --moss: #5c8f48; --moss-deep: #3f6b30; --terracotta: #d9786a;
    --gold: #f2d27a; --sky-blue: #4a7fc0; --signal-red: #e0574b;
    --control-plus: #5fc35a; --control-minus: #f5c04a; --control-close: #f0675c;
    --stroke-base: 1.5px; --radius-md: 7px; --radius-lg: 9px; --radius-pill: 999px;
    --shadow-hard: 3px 3px 0 var(--ink);
  }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 16px;
         color: var(--ink); background-color: var(--ground);
         background-image: radial-gradient(var(--surface-alt) 2.4px, transparent 2.8px);
         background-size: 44px 44px;
         font: 500 16px/1.4 "Fredoka", "Nunito", system-ui, sans-serif; }
  /* The shapes from the Sleek Matcha LinkedIn banner, scattered around the
     screen behind the window. --u is one banner pixel: 1px on a wide screen,
     shrinking to 0.55px on a phone. */
  .backdrop { --u: clamp(0.55px, 0.07vw, 1px); position: fixed; inset: 0; overflow: hidden; pointer-events: none; }
  .backdrop svg { position: absolute; display: block; overflow: visible; }
  .stripes { left: 0; bottom: 0; width: calc(320 * var(--u)); aspect-ratio: 320 / 396; }
  .arch { right: 0; top: 0; height: min(100vh, 90vw); aspect-ratio: 184 / 396; overflow: hidden !important; }
  .dots { top: 7%; left: 26%; width: calc(284 * var(--u)); aspect-ratio: 284 / 48; }
  .crosses { top: 15%; left: 63%; width: calc(50 * var(--u)); aspect-ratio: 50 / 120; }
  .dome { top: 27%; left: 40%; width: calc(72 * var(--u)); aspect-ratio: 72 / 42; }
  .romduol { top: 38%; left: 17%; width: calc(66 * var(--u)); aspect-ratio: 1; }
  .xs { top: 64%; left: 30%; width: calc(56 * var(--u)); aspect-ratio: 56 / 194; }
  .star { bottom: 9%; left: 58%; width: calc(108 * var(--u)); aspect-ratio: 1; }
  .bars { bottom: calc(-16 * var(--u)); left: 41%; width: calc(60 * var(--u)); aspect-ratio: 60 / 64; }
  .ring { width: calc(18 * var(--u)); aspect-ratio: 1; }
  @media (max-width: 600px) { .romduol { top: 70%; left: 52%; } }
  main { position: relative; width: 100%; max-width: 380px; background: var(--surface); overflow: hidden;
         border: var(--stroke-base) solid var(--ink); border-radius: var(--radius-lg);
         box-shadow: var(--shadow-hard); }
  .bar { height: 32px; display: flex; align-items: center; justify-content: space-between; gap: 8px;
         padding: 0 10px; border-bottom: var(--stroke-base) solid var(--ink);
         background-color: var(--bark);
         background-image: linear-gradient(var(--bark-grid) 1px, transparent 1px),
                           linear-gradient(90deg, var(--bark-grid) 1px, transparent 1px);
         background-size: 6px 6px; }
  .bar span { font-size: 14px; letter-spacing: 0.3px; color: var(--surface); }
  .body { padding: 28px 22px 22px; text-align: center; }
  h1 { margin: 0 0 4px; font-size: 28px; font-weight: 600; line-height: 1.1; }
  p { margin: 0 0 22px; }
  .error { display: flex; align-items: center; gap: 8px; text-align: left; padding: 8px 12px;
           background: var(--paper); border: var(--stroke-base) solid var(--ink); border-radius: var(--radius-md); }
  .error::before { content: ""; flex: none; width: 10px; height: 10px; border-radius: 50%;
           background: var(--signal-red); border: var(--stroke-base) solid var(--ink); }
  button, a.button { display: flex; align-items: center; justify-content: center; gap: 10px;
         width: 100%; min-height: 54px; padding: 0 20px; margin-top: 10px; border-radius: var(--radius-pill);
         font: inherit; cursor: pointer; text-decoration: none;
         border: var(--stroke-base) solid var(--ink); background: var(--paper); color: var(--ink); }
  button:active, a.button:active, button.primary, a.button.primary { background: var(--bark); color: var(--cream); }
  button:focus-visible, a.button:focus-visible { outline: 3px solid var(--sky-blue); outline-offset: 3px; }
  button:disabled { cursor: progress; opacity: 0.7; }
  #google { padding-left: 7px; }
  .g { flex: none; width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center;
       background: var(--white); border: var(--stroke-base) solid var(--ink); }
  @media (max-width: 360px) { .body { padding: 22px 14px 16px; } }
  [hidden] { display: none !important; }
</style>
</head>
<body>
<div class="backdrop" aria-hidden="true">
  <svg class="stripes" viewBox="0 0 320 396">
    <rect x="0" y="-2000" width="320" height="2396" fill="var(--paper)" fill-opacity="0.7"/>
    <circle cx="0" cy="350" r="78" fill="var(--surface-alt)"/>
    <rect x="0" y="-2000" width="140" height="2300" rx="70" fill="var(--moss)"/>
    <path d="M100 -2000 V150 A55 55 0 0 0 210 150 V-2000" fill="none" stroke="var(--terracotta)" stroke-width="12"/>
    <circle cx="250" cy="430" r="120" fill="var(--gold)"/>
    <g fill="none" stroke="var(--moss-deep)" stroke-width="6">
      <circle cx="38" cy="362" r="11"/><circle cx="82" cy="362" r="11"/><circle cx="126" cy="362" r="11"/>
    </g>
    <path d="M40 396 A60 60 0 0 1 160 396 M20 396 A80 80 0 0 1 180 396 M0 396 A100 100 0 0 1 200 396 M-20 396 A120 120 0 0 1 220 396 M-40 396 A140 140 0 0 1 240 396 M-60 396 A160 160 0 0 1 260 396" fill="none" stroke="var(--ink)" stroke-width="4"/>
  </svg>
  <svg class="arch" viewBox="1400 0 184 396">
    <circle cx="1572" cy="20" r="80" fill="var(--moss)"/>
    <path d="M1470 400 V180 A60 60 0 0 1 1590 180 V400" fill="none" stroke="var(--ink)" stroke-width="10"/>
    <circle cx="1570" cy="420" r="150" fill="var(--surface-alt)"/>
    <rect x="1548" y="150" width="18" height="260" rx="9" fill="var(--terracotta)"/>
  </svg>
  <svg class="dots" viewBox="270 22 284 48">
    <g fill="var(--ink)">
      <circle cx="280" cy="46" r="6"/><circle cx="306" cy="46" r="6"/><circle cx="332" cy="46" r="6"/>
      <circle cx="358" cy="46" r="6"/><circle cx="384" cy="46" r="6"/><circle cx="410" cy="46" r="6"/>
      <circle cx="436" cy="46" r="6"/><circle cx="462" cy="46" r="6"/><circle cx="488" cy="46" r="6"/>
    </g>
    <path d="M512 28 L548 64 M548 28 L512 64" stroke="var(--bark)" stroke-width="13" stroke-linecap="round"/>
  </svg>
  <svg class="crosses" viewBox="548 108 50 120">
    <path d="M554 114 L566 126 M566 114 L554 126 M580 114 L592 126 M592 114 L580 126 M554 138 L566 150 M566 138 L554 150 M580 138 L592 150 M592 138 L580 150 M554 162 L566 174 M566 162 L554 174 M580 162 L592 174 M592 162 L580 174 M554 186 L566 198 M566 186 L554 198 M580 186 L592 198 M592 186 L580 198 M554 210 L566 222 M566 210 L554 222 M580 210 L592 222 M592 210 L580 222" stroke="var(--terracotta)" stroke-width="5" stroke-linecap="round"/>
  </svg>
  <svg class="dome" viewBox="266 92 72 42">
    <path d="M272 128 A30 30 0 0 1 332 128 Z" fill="none" stroke="var(--terracotta)" stroke-width="6" stroke-linejoin="round"/>
  </svg>
  <svg class="romduol" viewBox="-14 -14 28 28">
    <g stroke="var(--ink)" stroke-linejoin="round">
      <path d="M0 0 C 5 -3, 7 -9, 0 -11 C -7 -9, -5 -3, 0 0 Z" fill="var(--cream)" stroke-width="0.9"/>
      <path d="M0 0 C 5 -3, 7 -9, 0 -11 C -7 -9, -5 -3, 0 0 Z" fill="var(--cream)" stroke-width="0.9" transform="rotate(120)"/>
      <path d="M0 0 C 5 -3, 7 -9, 0 -11 C -7 -9, -5 -3, 0 0 Z" fill="var(--cream)" stroke-width="0.9" transform="rotate(240)"/>
      <circle r="4.2" fill="var(--gold)" stroke-width="0.9"/>
      <path d="M0 -4 V0 M0 0 L3.6 2.1 M0 0 L-3.6 2.1" fill="none" stroke-width="0.6"/>
    </g>
  </svg>
  <svg class="xs" viewBox="212 182 56 194">
    <circle cx="240" cy="200" r="15" fill="var(--ink)"/>
    <path d="M222 274 L258 310 M258 274 L222 310 M222 334 L258 370 M258 334 L222 370" stroke="var(--bark)" stroke-width="13" stroke-linecap="round"/>
  </svg>
  <svg class="star" viewBox="546 266 108 108">
    <path d="M552 320 H648 M600 272 V368 M566 286 L634 354 M634 286 L566 354" stroke="var(--sky-blue)" stroke-width="9" stroke-linecap="round"/>
  </svg>
  <svg class="bars" viewBox="648 346 60 64">
    <g fill="var(--terracotta)">
      <rect x="652" y="350" width="9" height="60" rx="4.5"/><rect x="674" y="350" width="9" height="60" rx="4.5"/><rect x="696" y="350" width="9" height="60" rx="4.5"/>
    </g>
  </svg>
  <svg class="ring" style="top: 10%; left: 12%" viewBox="-9 -9 18 18"><circle r="6" fill="none" stroke="var(--terracotta)" stroke-width="3"/></svg>
  <svg class="ring" style="top: 19%; left: 49%" viewBox="-9 -9 18 18"><circle r="6" fill="none" stroke="var(--terracotta)" stroke-width="3"/></svg>
  <svg class="ring" style="top: 33%; left: 80%" viewBox="-9 -9 18 18"><circle r="6" fill="none" stroke="var(--terracotta)" stroke-width="3"/></svg>
  <svg class="ring" style="top: 45%; left: 66%" viewBox="-9 -9 18 18"><circle r="6" fill="none" stroke="var(--terracotta)" stroke-width="3"/></svg>
  <svg class="ring" style="top: 74%; left: 19%" viewBox="-9 -9 18 18"><circle r="6" fill="none" stroke="var(--terracotta)" stroke-width="3"/></svg>
  <svg class="ring" style="top: 80%; left: 72%" viewBox="-9 -9 18 18"><circle r="6" fill="none" stroke="var(--terracotta)" stroke-width="3"/></svg>
  <svg class="ring" style="top: 88%; left: 34%" viewBox="-9 -9 18 18"><circle r="6" fill="none" stroke="var(--terracotta)" stroke-width="3"/></svg>
</div>
<main>
  <div class="bar">
    <span>account.exe</span>
    <svg width="41" height="13" viewBox="0 0 29 9" aria-hidden="true">
      <circle cx="4.5" cy="4.5" r="3.8" fill="var(--control-plus)" stroke="var(--ink)" stroke-width="1"/>
      <circle cx="14.5" cy="4.5" r="3.8" fill="var(--control-minus)" stroke="var(--ink)" stroke-width="1"/>
      <circle cx="24.5" cy="4.5" r="3.8" fill="var(--control-close)" stroke="var(--ink)" stroke-width="1"/>
      <path d="M2.8 4.5 H6.2 M4.5 2.8 V6.2 M12.8 4.5 H16.2 M23 3 L26 6 M26 3 L23 6" stroke="var(--ink)" stroke-width="1" stroke-linecap="round"/>
    </svg>
  </div>
  <div class="body">
    <h1>IrmaHS Labs</h1>
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
  </div>
</main>
<script>
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
</body>
</html>
`;
