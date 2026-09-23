import { describe, expect, it } from "vitest";
import { optionalLogNumber, parseBloodPressure } from "./dailyHealthInput";

describe("daily health-log inputs", () => {
  it("parses a familiar systolic/diastolic reading", () => {
    expect(parseBloodPressure("120/80")).toEqual({ systolicPressure: 120, diastolicPressure: 80 });
    expect(parseBloodPressure("120")).toBeUndefined();
  });

  it("keeps empty optional entries absent and accepts non-negative log values", () => {
    expect(optionalLogNumber(" ")).toBeUndefined();
    expect(optionalLogNumber("6500")).toBe(6500);
    expect(optionalLogNumber("-1")).toBeUndefined();
  });
});
