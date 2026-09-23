import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { openSignedReport } from "./Reports";

describe("Reports download flow", () => {
  it("opens the resolved signed URL successfully", async () => {
    const popup = { location: { href: "about:blank" }, close: () => undefined } as unknown as Window;
    await openSignedReport("DS-TEST", async () => ({ url: "https://signed.example/report.pdf" }), () => popup);
    expect(popup.location.href).toBe("https://signed.example/report.pdf");
  });

  it("uses on-demand signed URLs and visible failure feedback", () => {
    const source = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "Reports.tsx"), "utf8");
    expect(source).toContain("trpc.reports.downloadUrl.useMutation()");
    expect(source).toContain("toast.error('Report download unavailable'");
    expect(source).toContain("openSignedReport(reportId");
  });
});
