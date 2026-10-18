// What someone sees when they are signed in, but not with an account that may
// open this private app. They can sign in with another one from the sign-in
// page, which has a Sign out button.

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export const noAccessPage = (email: string, signInUrl: string): string => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Private · IrmaHS Labs</title>
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
  a { display: block; padding: 12px; border-radius: 8px; text-decoration: none;
      background: var(--accent); color: var(--card); }
</style>
</head>
<body>
<main>
  <h1>This app is private</h1>
  <p>You are signed in as ${escapeHtml(email)}, which does not have access.</p>
  <a href="${escapeHtml(signInUrl)}">Use another account</a>
</main>
</body>
</html>
`;
