import { describe, expect, it } from "vitest";
import { buildDailyLogsCsv } from "./dailyLogExport";

describe("daily health-log export", () => {
  it("includes each real-life daily value in a CSV-safe export", () => {
    const csv = buildDailyLogsCsv([{ createdAt: "2026-08-27T12:00:00.000Z", glucose: 105, systolicPressure: 120, diastolicPressure: 80, steps: 6500, sleepHours: 7.5, waterMl: 2000, movementMinutes: 30 }]);
    expect(csv).toContain('"Blood pressure"');
    expect(csv).toContain('"120/80"');
    expect(csv).toContain('"6500"');
  });
});
