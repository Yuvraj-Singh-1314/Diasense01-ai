export type RiskCategory = 'Low risk' | 'Moderate risk' | 'High risk';

export function calculateBmi(heightCm: number, weightKg: number) {
  if (!Number.isFinite(heightCm) || !Number.isFinite(weightKg) || heightCm <= 0 || weightKg <= 0) return 0;
  return Number((weightKg / Math.pow(heightCm / 100, 2)).toFixed(1));
}

export function calculateRisk(input: { age: number; bmi: number; glucose?: number; familyHistory?: boolean; activity?: 'low' | 'moderate' | 'high' }) {
  const ageScore = Math.max(0, input.age - 18) * 0.55;
  const bmiScore = input.bmi > 25 ? (input.bmi - 25) * 3 : 0;
  const glucoseScore = input.glucose && input.glucose > 100 ? (input.glucose - 100) * 0.18 : 0;
  const familyScore = input.familyHistory ? 12 : 0;
  const activityScore = input.activity === 'low' ? 9 : input.activity === 'high' ? -4 : 0;
  return Math.min(95, Math.max(5, Math.round(8 + ageScore + bmiScore + glucoseScore + familyScore + activityScore)));
}

export function riskCategory(risk: number): RiskCategory {
  if (risk < 25) return 'Low risk';
  if (risk < 55) return 'Moderate risk';
  return 'High risk';
}

export function healthScore(risk: number) {
  return Math.max(5, Math.min(100, 100 - risk));
}

export function recommendations(input: { bmi: number; activity?: 'low' | 'moderate' | 'high'; sleepHours?: number }) {
  return {
    diet: input.bmi >= 25 ? 'Build meals around fiber-rich vegetables, lean protein, and measured portions.' : 'Keep a balanced plate with fiber-forward foods and consistent meal timing.',
    exercise: input.activity === 'low' ? 'Start with a 12-minute walk after one meal each day, then build gradually.' : 'Maintain regular movement and add strength work twice weekly if appropriate.',
    lifestyle: (input.sleepHours ?? 7) < 7 ? 'Protect a consistent wind-down window and aim for more restorative sleep.' : 'Keep your sleep window consistent and make stress recovery part of the routine.',
  };
}
