import { describe, expect, it } from "vitest";
import { reminderCron, reminderDateInTimezone } from "./dailyReminderUtils";

describe("daily reminder scheduling utilities", () => {
  it("converts a user-selected local reminder time into six-field UTC cron", () => {
    expect(reminderCron("19:30", -330)).toBe("0 0 14 * * *");
    expect(reminderCron("08:00", 0)).toBe("0 0 8 * * *");
  });

  it("uses the saved timezone offset when deriving an idempotent reminder date", () => {
    expect(reminderDateInTimezone(-330, new Date("2026-08-27T19:00:00.000Z"))).toBe("2026-08-28");
  });
});
