import type { Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { createScheduledDailyReminder, getDailyReminderSettingByTaskUid } from "./db";
import { dailyReminderMessage, reminderDateInTimezone } from "./dailyReminderUtils";

export async function deliverDailyHealthReminder(req: Request, res: Response) {
  let taskUid: string | undefined;
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    taskUid = user.taskUid;
    const setting = await getDailyReminderSettingByTaskUid(taskUid);
    if (!setting || !setting.enabled) return res.json({ ok: true, skipped: "inactive-or-orphan" });
    await createScheduledDailyReminder({ settingId: setting.id, userId: setting.userId, reminderDate: reminderDateInTimezone(setting.timezoneOffsetMinutes), message: dailyReminderMessage });
    return res.json({ ok: true });
  } catch (error) {
    console.error("[Daily reminder] scheduled delivery failed", error);
    return res.status(500).json({ error: String(error), context: { taskUid: taskUid ?? null }, timestamp: new Date().toISOString() });
  }
}
