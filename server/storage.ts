import { mkdir, writeFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";

const STORAGE_ROOT = path.resolve(process.cwd(), "storage");

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");

  if (lastDot === -1) {
    return `${relKey}_${hash}`;
  }

  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

function getSafeStoragePath(key: string): string {
  const normalized = path
    .normalize(key)
    .replace(/^(\.\.(\/|\\|$))+/, "");

  const filePath = path.resolve(STORAGE_ROOT, normalized);

  if (
    filePath !== STORAGE_ROOT &&
    !filePath.startsWith(`${STORAGE_ROOT}${path.sep}`)
  ) {
    throw new Error("Invalid storage path");
  }

  return filePath;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  _contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));
  const filePath = getSafeStoragePath(key);

  await mkdir(path.dirname(filePath), {
    recursive: true,
  });

  const buffer =
    typeof data === "string"
      ? Buffer.from(data)
      : Buffer.from(data);

  await writeFile(filePath, buffer);

  return {
    key,
    url: `/manus-storage/${key}`,
  };
}

export async function storageGet(
  relKey: string,
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);

  return {
    key,
    url: `/manus-storage/${key}`,
  };
}

export async function storageGetSignedUrl(
  relKey: string,
): Promise<string> {
  const key = normalizeKey(relKey);
  const filePath = getSafeStoragePath(key);

  try {
    await access(filePath, constants.F_OK);
  } catch {
    throw new Error("Stored file not found");
  }

  return `/manus-storage/${key}`;
}