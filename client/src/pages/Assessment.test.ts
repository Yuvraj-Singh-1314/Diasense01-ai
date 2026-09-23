import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("Assessment access and stable simplified flow", () => {
  it("sends logged-out visitors to a sign-in route that returns to the assessment", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Assessment.tsx"), "utf8");
    expect(source).toContain('signInPathFor("/assessment")');
    expect(source).toContain("Sign in to run assessment");
    expect(source).toContain("After you sign in, you will return here");
  });

  it("shows and submits Pregnancy Status only for the female profile", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Assessment.tsx"), "utf8");
    expect(source).toContain("bloodPressure: parseDiastolicPressure(bloodPressure)");
    expect(source).toContain("glucose: optionalPositiveNumber(glucose)");
    expect(source).toContain("onSuccess: setResult");
    expect(source).toContain("Blood pressure");
    expect(source).not.toContain("Pregnancies");
    expect(source).toContain('gender === "female" && <label');
    expect(source).toContain("Pregnancy status");
    expect(source).toContain('pregnancyStatus: gender === "female" ? pregnancyStatus : undefined');
  });
});
