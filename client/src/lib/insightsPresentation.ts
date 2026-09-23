export type InsightSignal = { bmi: number; riskPercentage: number; healthScore: number; createdAt: Date | string };

export const bmiStatus = (bmi: number) => {
  if (bmi < 18.5) return { label: "Below standard range", tone: "text-amber-300", width: 28 };
  if (bmi < 25) return { label: "Standard range", tone: "text-emerald-300", width: 48 };
  if (bmi < 30) return { label: "Above standard range", tone: "text-amber-300", width: 68 };
  return { label: "Higher BMI range", tone: "text-rose-300", width: 86 };
};

export const historyDelta = (history: InsightSignal[], field: "riskPercentage" | "healthScore") => {
  if (history.length < 2) return null;
  return history[0][field] - history[1][field];
};

export const riskTrendCopy = (history: InsightSignal[]) => {
  const delta = historyDelta(history, "riskPercentage");
  if (delta === null) return { value: "—", label: "Need a second assessment", body: "Your trend will appear after another completed assessment." };
  if (delta < 0) return { value: `${delta} pts`, label: "Lower than your previous assessment", body: "This compares your two most recent saved risk signals." };
  if (delta > 0) return { value: `+${delta} pts`, label: "Higher than your previous assessment", body: "This compares your two most recent saved risk signals." };
  return { value: "0 pts", label: "Unchanged from previous assessment", body: "This compares your two most recent saved risk signals." };
};

export const scoreTrendCopy = (history: InsightSignal[]) => {
  const delta = historyDelta(history, "healthScore");
  if (delta === null) return { value: "—", label: "Need a second assessment", body: "Your latest saved health score is shown above." };
  if (delta > 0) return { value: `+${delta} points`, label: "Higher than your previous assessment", body: "This compares your two most recent saved health scores." };
  if (delta < 0) return { value: `${delta} points`, label: "Lower than your previous assessment", body: "This compares your two most recent saved health scores." };
  return { value: "0 points", label: "Unchanged from previous assessment", body: "This compares your two most recent saved health scores." };
};
