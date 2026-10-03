// The same rule Better Auth applies to trustedOrigins, so CORS and the
// sign-in page's redirect check never disagree with it: an exact origin, or
// `*` standing for exactly one subdomain label.

function toPattern(origin: string): RegExp {
  const escaped = origin.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped.replace("*", "[a-z0-9-]+")}$`);
}

export function originMatcher(trusted: string[]): (origin: string) => boolean {
  const patterns = trusted.map(toPattern);
  return (origin) => patterns.some((pattern) => pattern.test(origin));
}

// The origin of a URL, or null when it is not an absolute http(s) URL.
export function originOf(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.origin : null;
  } catch {
    return null;
  }
}
