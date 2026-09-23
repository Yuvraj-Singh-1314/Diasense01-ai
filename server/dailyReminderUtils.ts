export function reminderCron(reminderTime: string, timezoneOffsetMinutes: number) {
  const [hours, minutes] = reminderTime.split(":").map(Number);
  const utcMinutes = (hours * 60 + minutes + timezoneOffsetMinutes + 1440) % 1440;
  return `0 ${utcMinutes % 60} ${Math.floor(utcMinutes / 60)} * * *`;
}

export function reminderDateInTimezone(timezoneOffsetMinutes: number, now = new Date()) {
  return new Date(now.getTime() - timezoneOffsetMinutes * 60_000).toISOString().slice(0, 10);
}

export const dailyReminderMessage = "It’s time for your private Daily Health Check-in. Add today’s habits or readings when you’re ready.";
