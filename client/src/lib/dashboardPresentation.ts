export type DashboardSignal = { riskPercentage: number; category: string; createdAt: Date | string };

export const greetingForHour = (hour: number) => hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

export const signalDateLabel = (value: Date | string, options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) => new Intl.DateTimeFormat(undefined, options).format(new Date(value));

export const latestSignalCopy = (signal: DashboardSignal | null) => {
  if (!signal) return "Complete an assessment to create your first health signal.";
  if (signal.category === "High risk") return "Your newest signal suggests timely clinician follow-up.";
  if (signal.category === "Moderate risk") return "Your newest signal shows areas where steady habits can help.";
  return "Your newest signal is available. Keep building consistent health habits.";
};
