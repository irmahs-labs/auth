// The window every page of this service is drawn in: Cute Matcha's role
// tokens, in Light Matcha or Dark Matcha as the device prefers,
// with the Funky Background's shapes behind an "account.exe" window. A page gives its title, what goes inside the window,
// and an optional <script>.

export const page = (
  title: string,
  body: string,
  script = ""
): string => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600&family=Nunito+Sans:wght@400;700&display=swap">
<style>
  /* Cute Matcha's role tokens, named by job: Light Matcha, then Dark Matcha
     when the device asks for dark. Pick a token by what the
     thing is, never by its hex. */
  :root {
    --ground: #f3f1c8; --panel: #f7f8de; --raised: #fffdf0;
    --text: #2f3b34; --text-muted: #3f6b30; --outline: #2f3b34;
    --accent: #d4dd9c; --accent-soft: #afc584; --on-accent: #2f3b34;
    --strong: #3b4a42; --on-strong: #fff3cf; --grid: #4e6152;
    --pattern-dot: #afc584; --focus: #4a7fc0; --danger: #f0675c;
    /* Fixed: drawing colours, the same in both themes */
    --moss: #5c8f48; --gold: #f2d27a; --terracotta: #d9786a; --cream: #fff3cf;
    --ink: #2f3b34; --white: #fff;
    --stroke-base: 1.5px; --radius-md: 7px; --radius-lg: 9px; --radius-pill: 999px;
    /* Hard shadows are the same near-black in both themes */
    --shadow-hard: 3px 3px 0 #0f1411;
    --display: "Fredoka", "Nunito Sans", system-ui, sans-serif;
    --body: "Nunito Sans", "Fredoka", system-ui, sans-serif;
    color-scheme: light;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --ground: #46574b; --panel: #52645a; --raised: #2f3d34;
      --text: #f3f1c8; --text-muted: #d4e396; --outline: #0f1411;
      --accent: #c9d68f; --accent-soft: #9eb27a; --on-accent: #0f1411;
      --strong: #1c2420; --on-strong: #f3f1c8; --grid: #2f3b34;
      --pattern-dot: #4d5f52; --focus: #c2d8f5; --danger: #f6a49d;
      color-scheme: dark;
    }
  }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 16px;
         color: var(--text); background-color: var(--ground);
         background-image: radial-gradient(var(--pattern-dot) 2.4px, transparent 2.8px);
         background-size: 44px 44px;
         font: 400 16px/1.4 var(--body); }
  /* The shapes from the Cute Matcha LinkedIn banner, scattered around the
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
  /* The window: an accent body, so its text is on-accent in both themes */
  main { position: relative; width: 100%; max-width: 380px; background: var(--accent); overflow: hidden;
         color: var(--on-accent);
         border: var(--stroke-base) solid var(--outline); border-radius: var(--radius-lg);
         box-shadow: var(--shadow-hard); }
  .bar { height: 32px; display: flex; align-items: center; justify-content: space-between; gap: 8px;
         padding: 0 10px; border-bottom: var(--stroke-base) solid var(--outline);
         background-color: var(--strong);
         background-image: linear-gradient(var(--grid) 1px, transparent 1px),
                           linear-gradient(90deg, var(--grid) 1px, transparent 1px);
         background-size: 6px 6px; }
  .bar span { font: 500 14px/1.2 var(--display); letter-spacing: 0.3px; color: var(--on-strong); }
  .body { padding: 28px 22px 22px; text-align: center; }
  h1 { margin: 0 0 4px; font: 600 28px/1.1 var(--display); }
  p { margin: 0 0 22px; }
  .error { display: flex; align-items: center; gap: 8px; text-align: left; padding: 8px 12px;
           background: var(--panel); color: var(--text);
           border: var(--stroke-base) solid var(--outline); border-radius: var(--radius-md); }
  .error::before { content: ""; flex: none; width: 10px; height: 10px; border-radius: 50%;
           background: var(--danger); border: var(--stroke-base) solid var(--outline); }
  button, a.button { display: flex; align-items: center; justify-content: center; gap: 10px;
         width: 100%; min-height: 54px; padding: 0 20px; margin-top: 10px; border-radius: var(--radius-pill);
         font: 700 16px/1.2 var(--body); cursor: pointer; text-decoration: none;
         border: 2px solid var(--outline); background: var(--raised); color: var(--text); }
  /* The one thing to press next, full width like Cute Matcha's Export pill:
     strong with the hard shadow, which stands out on the accent window
     where an accent button would vanish into it. */
  button.primary, a.button.primary { background: var(--strong); color: var(--on-strong); box-shadow: var(--shadow-hard); }
  button.primary:hover, a.button.primary:hover { transform: translate(-1px, -1px); box-shadow: 4px 4px 0 #0f1411; }
  button:active, a.button:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0 #0f1411; }
  button:focus-visible, a.button:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }
  button:disabled { cursor: progress; opacity: 0.7; }
  #google { padding-left: 7px; }
  .g { flex: none; width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center;
       background: var(--white); border: var(--stroke-base) solid var(--outline); }
  @media (max-width: 360px) { .body { padding: 22px 14px 16px; } }
  [hidden] { display: none !important; }
</style>
</head>
<body>
<div class="backdrop" aria-hidden="true">
  <svg class="stripes" viewBox="0 0 320 396">
    <rect x="0" y="-2000" width="320" height="2396" fill="var(--panel)" fill-opacity="0.7"/>
    <circle cx="0" cy="350" r="78" fill="var(--accent-soft)"/>
    <rect x="0" y="-2000" width="140" height="2300" rx="70" fill="var(--moss)"/>
    <path d="M100 -2000 V150 A55 55 0 0 0 210 150 V-2000" fill="none" stroke="var(--terracotta)" stroke-width="12"/>
    <circle cx="250" cy="430" r="120" fill="var(--gold)"/>
    <g fill="none" stroke="var(--text-muted)" stroke-width="6">
      <circle cx="38" cy="362" r="11"/><circle cx="82" cy="362" r="11"/><circle cx="126" cy="362" r="11"/>
    </g>
    <path d="M40 396 A60 60 0 0 1 160 396 M20 396 A80 80 0 0 1 180 396 M0 396 A100 100 0 0 1 200 396 M-20 396 A120 120 0 0 1 220 396 M-40 396 A140 140 0 0 1 240 396 M-60 396 A160 160 0 0 1 260 396" fill="none" stroke="var(--outline)" stroke-width="4"/>
  </svg>
  <svg class="arch" viewBox="1400 0 184 396">
    <circle cx="1572" cy="20" r="80" fill="var(--moss)"/>
    <path d="M1470 400 V180 A60 60 0 0 1 1590 180 V400" fill="none" stroke="var(--outline)" stroke-width="10"/>
    <circle cx="1570" cy="420" r="150" fill="var(--accent-soft)"/>
    <rect x="1548" y="150" width="18" height="260" rx="9" fill="var(--terracotta)"/>
  </svg>
  <svg class="dots" viewBox="270 22 284 48">
    <g fill="var(--outline)">
      <circle cx="280" cy="46" r="6"/><circle cx="306" cy="46" r="6"/><circle cx="332" cy="46" r="6"/>
      <circle cx="358" cy="46" r="6"/><circle cx="384" cy="46" r="6"/><circle cx="410" cy="46" r="6"/>
      <circle cx="436" cy="46" r="6"/><circle cx="462" cy="46" r="6"/><circle cx="488" cy="46" r="6"/>
    </g>
    <path d="M512 28 L548 64 M548 28 L512 64" stroke="var(--strong)" stroke-width="13" stroke-linecap="round"/>
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
    <circle cx="240" cy="200" r="15" fill="var(--outline)"/>
    <path d="M222 274 L258 310 M258 274 L222 310 M222 334 L258 370 M258 334 L222 370" stroke="var(--strong)" stroke-width="13" stroke-linecap="round"/>
  </svg>
  <svg class="star" viewBox="546 266 108 108">
    <path d="M552 320 H648 M600 272 V368 M566 286 L634 354 M634 286 L566 354" stroke="var(--focus)" stroke-width="9" stroke-linecap="round"/>
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
      <circle cx="4.5" cy="4.5" r="3.8" fill="var(--moss)" stroke="var(--ink)" stroke-width="1"/>
      <circle cx="14.5" cy="4.5" r="3.8" fill="var(--gold)" stroke="var(--ink)" stroke-width="1"/>
      <circle cx="24.5" cy="4.5" r="3.8" fill="var(--danger)" stroke="var(--ink)" stroke-width="1"/>
      <path d="M2.8 4.5 H6.2 M4.5 2.8 V6.2 M12.8 4.5 H16.2 M23 3 L26 6 M26 3 L23 6" stroke="var(--ink)" stroke-width="1" stroke-linecap="round"/>
    </svg>
  </div>
  <div class="body">
${body}  </div>
</main>
${script}</body>
</html>
`;
