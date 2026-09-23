export function parseDiastolicPressure(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const ratio = trimmed.match(/^\s*\d{2,3}\s*\/\s*(\d{2,3})\s*$/);
  const numeric = ratio ? Number(ratio[1]) : Number(trimmed);
  return Number.isFinite(numeric) && numeric > 0 && numeric <= 200 ? numeric : undefined;
}

export function optionalPositiveNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
}
