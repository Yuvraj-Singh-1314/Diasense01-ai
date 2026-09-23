import { describe, expect, it } from "vitest";
import { optionalPositiveNumber, parseDiastolicPressure } from "./assessmentInput";

describe("simplified assessment input parsing", () => {
  it("uses the diastolic value from the familiar blood-pressure format", () => {
    expect(parseDiastolicPressure("120/80")).toBe(80);
    expect(parseDiastolicPressure(" 130 / 85 ")).toBe(85);
    expect(parseDiastolicPressure("")).toBeUndefined();
  });

  it("keeps blank optional simplified values undefined rather than inventing a value", () => {
    expect(optionalPositiveNumber("")).toBeUndefined();
    expect(optionalPositiveNumber("95")).toBe(95);
  });
});
