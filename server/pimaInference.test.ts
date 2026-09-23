import { describe, expect, it } from "vitest";
import { predictPimaRisk } from "./pimaInference";

const baseline = { age: 35, bmi: 23, glucose: 90, bloodPressure: 75, pregnancies: 0, skinThickness: 20, insulin: 80, diabetesPedigree: 0.3, familyHistory: false, activity: "moderate" as const };

describe("Pima ensemble inference", () => {
  it("returns a bounded persisted-model prediction and responds to materially different inputs", async () => {
    const lower = await predictPimaRisk(baseline);
    const higher = await predictPimaRisk({ ...baseline, age: 58, bmi: 34, glucose: 180, insulin: 210, diabetesPedigree: 1.2, familyHistory: true, activity: "low" });
    expect(lower.modelVersion).toBe("pima-rf-portable-v1");
    expect(lower.riskPercentage).toBeGreaterThanOrEqual(0);
    expect(higher.riskPercentage).toBeGreaterThan(lower.riskPercentage);
    expect(higher.confidence).toBeGreaterThanOrEqual(60);
  });
});
