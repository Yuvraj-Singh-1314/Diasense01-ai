import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("Daily Health Check-in page", () => {
  it("uses authenticated, user-scoped daily logs, charts, exports, and reminders while keeping assessment outcomes separate", () => {
    const source = readFileSync("client/src/pages/DailyLog.tsx", "utf8");
    expect(source).toContain("trpc.dailyLogs.list.useQuery");
    expect(source).toContain("trpc.dailyLogs.create.useMutation");
    expect(source).toContain("trpc.dailyLogs.exportData.useQuery");
    expect(source).toContain("DailyLogTrendChart");
    expect(source).toContain("downloadDailyLogsCsv");
    expect(source).toContain("downloadDailyLogsPdf");
    expect(source).toContain("trpc.dailyReminders.status.useQuery");
    expect(source).toContain("trpc.dailyReminders.save.useMutation");
    expect(source).toContain("These entries do not change your diabetes-risk assessment");
    expect(source).toContain('signInPathFor("/daily-log")');
  });
});
