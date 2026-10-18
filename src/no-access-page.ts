// What someone sees when they are signed in, but not with an account that may
// open this private app. They can sign in with another one from the sign-in
// page, which has a Sign out button.

import { page } from "./page.js";

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export const noAccessPage = (email: string, signInUrl: string): string =>
  page(
    "Private · IrmaHS Labs",
    `    <h1>This app is private</h1>
    <p>you are signed in as <strong style="overflow-wrap: anywhere">${escapeHtml(email)}</strong>, which does not have access</p>
    <a class="button primary" href="${escapeHtml(signInUrl)}">use another account</a>
`
  );
