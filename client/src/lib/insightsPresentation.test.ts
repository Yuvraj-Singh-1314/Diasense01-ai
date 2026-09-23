import { describe, expect, it } from "vitest";
import { bmiStatus, riskTrendCopy, scoreTrendCopy } from "./insightsPresentation";

const history = [
  { bmi: 23.7, riskPercentage: 17, healthScore: 83, createdAt: new Date("2026-08-23") },
  { bmi: 24.4, riskPercentage: 28, healthScore: 72, createdAt: new Date("2026-06-01") },
];

describe("Insights presentation", () => {
  it("calculates BMI and trend labels from the signed-in user history", () => {
    expect(bmiStatus(23.7).label).toBe("Standard range");
    expect(riskTrendCopy(history).value).toBe("-11 pts");
    expect(scoreTrendCopy(history).value).toBe("+11 points");
  });

  it("does not invent a trend when only one assessment exists", () => {
    expect(riskTrendCopy(history.slice(0, 1)).label).toBe("Need a second assessment");
    expect(scoreTrendCopy(history.slice(0, 1)).value).toBe("—");
  });
});
