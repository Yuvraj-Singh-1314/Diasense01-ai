import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

describe("Dashboard live summary", () => {
  it("uses authenticated dashboard data instead of static health values", () => {
    const source = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "Dashboard.tsx"), "utf8");
    expect(source).toContain("trpc.dashboard.summary.useQuery");
    expect(source).toContain("greetingForHour(hour)");
    expect(source).toContain("<TrendChart points={history}/>");
    expect(source).toContain("Latest completed assessment");
  });

  it("surfaces a user-owned unread daily check-in reminder without changing risk data", () => {
    const source = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "Dashboard.tsx"), "utf8");
    expect(source).toContain("trpc.dailyReminders.status.useQuery");
    expect(source).toContain("DAILY CHECK-IN REMINDER");
    expect(source).toContain('href="/daily-log"');
  });
});
