import { describe, expect, it } from 'vitest';
import { calculateBmi, calculateRisk, healthScore, recommendations, riskCategory } from '../shared/health';

describe('health calculations', () => {
  it('calculates BMI to one decimal place', () => expect(calculateBmi(172, 70)).toBe(23.7));
  it('keeps risk within bounds and maps category', () => {
    const risk = calculateRisk({ age: 34, bmi: 23.7, activity: 'moderate' });
    expect(risk).toBeGreaterThanOrEqual(5);
    expect(riskCategory(risk)).toBe('Low risk');
  });
  it('derives health score as inverse risk', () => expect(healthScore(18)).toBe(82));
  it('returns tailored recommendations', () => {
    const plan = recommendations({ bmi: 29, activity: 'low', sleepHours: 6 });
    expect(plan.diet).toContain('fiber-rich');
    expect(plan.exercise).toContain('12-minute');
    expect(plan.lifestyle).toContain('sleep');
  });
});
