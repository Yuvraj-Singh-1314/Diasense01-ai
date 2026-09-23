import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("dashboard summary contract", () => {
  it("returns only the protected user-specific assessment summary", () => {
    const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    const dbSource = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
    expect(routerSource).toContain("dashboard: router({summary: protectedProcedure.query(({ctx})=>getDashboardSummary(ctx.user.id))})");
    expect(dbSource).toContain("getDashboardSummary(userId:number)");
    expect(dbSource).toContain("where(eq(assessments.userId,userId))");
  });
});
