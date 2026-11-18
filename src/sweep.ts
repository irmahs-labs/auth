// The CNIL recommends deleting accounts two years after their last use; the
// privacy policy (irmahs.dev/privacy) promises it.
export const INACTIVE = "2 years";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Deletes every account nobody has used for two years: not signed in since
 * (its "updatedAt", which signing in moves) and with no session refreshed
 * since. Its sessions and Google link go with it (on delete cascade).
 */
export const SWEEP_SQL = `delete from "user" u
where u."updatedAt" < now() - interval '${INACTIVE}'
  and not exists (
    select 1 from "session" s
    where s."userId" = u."id" and s."updatedAt" >= now() - interval '${INACTIVE}'
  )`;

/** The one thing the sweep asks of the database */
export interface Queryable {
  query: (sql: string) => Promise<{ rowCount: number | null }>;
}

export const sweepInactive = async (pool: Queryable) => {
  const result = await pool.query(SWEEP_SQL);

  return result.rowCount ?? 0;
};

/** Sweeps once at startup, then every day */
export const startSweeping = (pool: Queryable) => {
  const run = async () => {
    try {
      const deleted = await sweepInactive(pool);

      if (deleted > 0) {
        console.log(`deleted ${deleted} inactive account(s)`);
      }
    } catch (error) {
      console.error("inactive-account sweep failed", error);
    }
  };

  void run();

  return setInterval(run, DAY_MS);
};
