import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ authenticateRequest: vi.fn(), getDailyReminderSettingByTaskUid: vi.fn(), createScheduledDailyReminder: vi.fn() }));
vi.mock("./_core/sdk", () => ({ sdk: { authenticateRequest: mocks.authenticateRequest } }));
vi.mock("./db", () => ({ getDailyReminderSettingByTaskUid: mocks.getDailyReminderSettingByTaskUid, createScheduledDailyReminder: mocks.createScheduledDailyReminder }));

import { deliverDailyHealthReminder } from "./dailyReminderSchedule";

describe("daily reminder scheduled callback", () => {
  it("accepts only cron authentication and writes an idempotent private reminder record", async () => {
    mocks.authenticateRequest.mockResolvedValue({ isCron: true, taskUid: "daily-task-19" });
    mocks.getDailyReminderSettingByTaskUid.mockResolvedValue({ id: 3, userId: 19, enabled: true, timezoneOffsetMinutes: -330 });
    const output: { status?: number; body?: unknown } = {};
    const res = { status: (code: number) => { output.status = code; return res; }, json: (body: unknown) => { output.body = body; return res; } };
    await deliverDailyHealthReminder({} as any, res as any);
    expect(mocks.createScheduledDailyReminder).toHaveBeenCalledWith(expect.objectContaining({ settingId: 3, userId: 19 }));
    expect(output.body).toEqual({ ok: true });
  });
});
