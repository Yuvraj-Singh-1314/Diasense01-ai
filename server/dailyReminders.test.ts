import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createHeartbeatJob: vi.fn(), updateHeartbeatJob: vi.fn(), getDailyReminderSetting: vi.fn(), getLatestUnreadDailyReminder: vi.fn(), markDailyReminderSeen: vi.fn(), saveDailyReminderSetting: vi.fn(),
}));

vi.mock("./db", () => ({
  getDailyReminderSetting: mocks.getDailyReminderSetting, getLatestUnreadDailyReminder: mocks.getLatestUnreadDailyReminder, markDailyReminderSeen: mocks.markDailyReminderSeen, saveDailyReminderSetting: mocks.saveDailyReminderSetting,
}));
vi.mock("./_core/heartbeat", () => ({ createHeartbeatJob: mocks.createHeartbeatJob, updateHeartbeatJob: mocks.updateHeartbeatJob }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const ctx = { user: { id: 19, openId: "reminder-user", name: "Reminder User", email: "reminder@example.com", loginMethod: "password", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { headers: { cookie: "app_session_id=session-token" } } as TrpcContext["req"], res: {} as TrpcContext["res"] } as TrpcContext;

describe("dailyReminders procedures", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("creates a private daily background schedule when the user opts in", async () => {
    mocks.getDailyReminderSetting.mockResolvedValue(undefined);
    mocks.createHeartbeatJob.mockResolvedValue({ taskUid: "daily-task-19" });
    mocks.saveDailyReminderSetting.mockResolvedValue({ id: 3, userId: 19, enabled: true, reminderTime: "19:30" });
    const result = await appRouter.createCaller(ctx).dailyReminders.save({ enabled: true, reminderTime: "19:30", timezoneOffsetMinutes: -330 });
    expect(mocks.createHeartbeatJob).toHaveBeenCalledWith(expect.objectContaining({ cron: "0 0 14 * * *", path: "/api/scheduled/daily-health-reminder" }), "session-token");
    expect(mocks.saveDailyReminderSetting).toHaveBeenCalledWith(expect.objectContaining({ userId: 19, scheduleCronTaskUid: "daily-task-19" }));
    expect(result.setting.enabled).toBe(true);
  });

  it("updates an existing reminder schedule and exposes only the caller’s reminder status", async () => {
    mocks.getDailyReminderSetting.mockResolvedValue({ id: 3, userId: 19, enabled: true, reminderTime: "19:30", timezoneOffsetMinutes: -330, scheduleCronTaskUid: "daily-task-19" });
    mocks.updateHeartbeatJob.mockResolvedValue({});
    mocks.saveDailyReminderSetting.mockResolvedValue({ id: 3, userId: 19, enabled: false, reminderTime: "20:00" });
    mocks.getLatestUnreadDailyReminder.mockResolvedValue({ id: 7, userId: 19, message: "Check in" });
    await appRouter.createCaller(ctx).dailyReminders.save({ enabled: false, reminderTime: "20:00", timezoneOffsetMinutes: -330 });
    expect(mocks.updateHeartbeatJob).toHaveBeenCalledWith("daily-task-19", expect.objectContaining({ enable: false }), "session-token");
    await expect(appRouter.createCaller(ctx).dailyReminders.status()).resolves.toEqual({ setting: expect.objectContaining({ userId: 19 }), notice: expect.objectContaining({ userId: 19 }) });
  });
});
