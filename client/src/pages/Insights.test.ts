import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

describe("Insights routine actions", () => {
  it("persists each selected recommendation and exposes an active state", () => {
    const source = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "Insights.tsx"), "utf8");
    expect(source).toContain("diasense-routine-${user.id}");
    expect(source).toContain("localStorage.setItem(routineKey");
    expect(source).toContain("aria-pressed={isAdded}");
    expect(source).toContain("Added to routine");
  });

  it("uses the authenticated dashboard summary for BMI, risk, and health-score insights", () => {
    const source = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "Insights.tsx"), "utf8");
    expect(source).toContain("trpc.dashboard.summary.useQuery");
    expect(source).toContain("bmiStatus(latest.bmi)");
    expect(source).toContain("riskTrendCopy(history)");
    expect(source).toContain("scoreTrendCopy(history)");
  });
});
