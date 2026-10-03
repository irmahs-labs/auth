// Prints the SQL Better Auth needs that the database does not have yet.
// Used to write migrations, never to change the database itself:
//
//   npm run db:up && npm run db:schema
//
// Paste the output into a new file from `npm run db:new -- <name>`, under
// `-- migrate:up`, and write the matching `-- migrate:down` by hand.
import { getMigrations } from "better-auth/db/migration";

import { auth } from "../src/auth.js";

const { compileMigrations } = await getMigrations(auth.options);
const sql = await compileMigrations();
const statements = sql.replace(/;\s*$/u, "").trim();
console.log(
  statements
    ? `${statements};`
    : "-- nothing to add: the database matches Better Auth"
);
process.exit(0);
