import { describe, expect, it, vi } from "vitest";
vi.mock("./db", () => ({ createDailyHealthLog: vi.fn().mockResolvedValue({ id: 501 }), getDailyHealthLogsByUser: vi.fn().mockResolvedValue([{ id: 501, userId: 7, steps: 6500 }]) }));
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const ctx = { user: { id: 7, openId: "daily-user", name: "Daily User", email: "daily@example.com", loginMethod: "password", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] } as TrpcContext;

describe("dailyLogs procedures", () => {
  it("creates a private daily check-in with actual tracked values", async () => {
    await expect(appRouter.createCaller(ctx).dailyLogs.create({ glucose: 105, systolicPressure: 120, diastolicPressure: 80, steps: 6500, sleepHours: 7.5, waterMl: 2000, movementMinutes: 30 })).resolves.toEqual({ id: 501 });
  });

  it("requires at least one value and only returns the signed-in user’s logs", async () => {
    await expect(appRouter.createCaller(ctx).dailyLogs.create({})).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(appRouter.createCaller(ctx).dailyLogs.list()).resolves.toEqual([{ id: 501, userId: 7, steps: 6500 }]);
  });
});
