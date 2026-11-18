import { describe, expect, it, vi } from "vitest";

import { SWEEP_SQL, sweepInactive } from "./sweep.js";

describe("the inactive-account sweep", () => {
  it("deletes accounts unused for two years, sessions included", () => {
    expect(SWEEP_SQL).toContain(`delete from "user"`);
    expect(SWEEP_SQL).toContain(`u."updatedAt" < now() - interval '2 years'`);
    // A browser still signed in keeps its account, however old the sign-in
    expect(SWEEP_SQL).toContain(`s."updatedAt" >= now() - interval '2 years'`);
  });

  it("says how many it deleted", async () => {
    const query = vi.fn().mockResolvedValue({ rowCount: 2 });

    await expect(sweepInactive({ query })).resolves.toBe(2);
    expect(query).toHaveBeenCalledWith(SWEEP_SQL);
  });
});
