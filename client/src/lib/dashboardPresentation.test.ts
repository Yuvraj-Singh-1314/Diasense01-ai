import { describe, expect, it } from "vitest";
import { greetingForHour, latestSignalCopy } from "./dashboardPresentation";

describe("dashboard presentation", () => {
  it("selects the greeting from the local hour", () => {
    expect(greetingForHour(8)).toBe("Good morning");
    expect(greetingForHour(13)).toBe("Good afternoon");
    expect(greetingForHour(20)).toBe("Good evening");
  });

  it("uses the newest risk category for supportive summary copy", () => {
    expect(latestSignalCopy({ riskPercentage: 72, category: "High risk", createdAt: new Date() })).toContain("clinician");
    expect(latestSignalCopy(null)).toContain("Complete an assessment");
  });
});
