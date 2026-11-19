// APP_ACCESS="my-app=a@gmail.com,b@gmail.com;other-app=c@gmail.com": for each
// private app, by the name its Caddy block gives, the emails that may open it.
// A malformed entry throws, so a typo fails the deploy instead of quietly
// letting the wrong people in.
export const parseAppAccess = (value: string): Map<string, Set<string>> => {
  const access = new Map<string, Set<string>>();

  for (const entry of value.split(";")) {
    if (!entry.trim()) {
      continue;
    }

    const [rawName = "", emails = ""] = entry.split("=");
    const name = rawName.trim();

    const people = emails
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);

    if (!/^[a-z0-9-]+$/u.test(name) || people.length === 0) {
      throw new Error(
        `APP_ACCESS has a bad entry: "${entry}"; see .env.example`
      );
    }

    access.set(name, new Set(people));
  }

  return access;
};
