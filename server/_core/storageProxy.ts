import type { Express } from "express";
import path from "node:path";
import { access, constants } from "node:fs/promises";

const STORAGE_ROOT = path.resolve(process.cwd(), "storage");

function getSafeStoragePath(key: string): string | null {
  const normalized = path
    .normalize(key)
    .replace(/^(\.\.(\/|\\|$))+/, "");

  const filePath = path.resolve(STORAGE_ROOT, normalized);

  if (
    filePath !== STORAGE_ROOT &&
    !filePath.startsWith(`${STORAGE_ROOT}${path.sep}`)
  ) {
    return null;
  }

  return filePath;
}

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];

    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    const filePath = getSafeStoragePath(key);

    if (!filePath) {
      res.status(400).send("Invalid storage path");
      return;
    }

    try {
      await access(filePath, constants.F_OK);

      res.set(
        "Cache-Control",
        "private, max-age=3600",
      );

      res.sendFile(filePath);
    } catch {
      res.status(404).send("Stored report not found");
    }
  });
}