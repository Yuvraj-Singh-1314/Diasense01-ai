import { describe, expect, it } from "vitest";
import { getPostLoginPath, signInPathFor } from "./authRedirect";

describe("post-login routing", () => {
  it("returns an authenticated user to the assessment when requested", () => {
    expect(getPostLoginPath("?next=%2Fassessment")).toBe("/assessment");
    expect(signInPathFor("/assessment")).toBe("/auth?next=%2Fassessment");
  });

  it("rejects external and auth-loop return destinations", () => {
    expect(getPostLoginPath("?next=https%3A%2F%2Fevil.example")).toBe("/dashboard");
    expect(getPostLoginPath("?next=%2F%2Fevil.example")).toBe("/dashboard");
    expect(getPostLoginPath("?next=%2Fauth")).toBe("/dashboard");
  });
});
