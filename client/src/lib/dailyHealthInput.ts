export type BloodPressure = { systolicPressure: number; diastolicPressure: number };

export function parseBloodPressure(value: string): BloodPressure | undefined {
  const match = value.trim().match(/^(\d{2,3})\s*\/\s*(\d{2,3})$/);
  if (!match) return undefined;
  const systolicPressure = Number(match[1]);
  const diastolicPressure = Number(match[2]);
  if (!Number.isInteger(systolicPressure) || !Number.isInteger(diastolicPressure) || systolicPressure <= 0 || diastolicPressure <= 0) return undefined;
  return { systolicPressure, diastolicPressure };
}

export function optionalLogNumber(value: string): number | undefined {
  const normalized = value.trim();
  if (!normalized) return undefined;
  const numberValue = Number(normalized);
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : undefined;
}
