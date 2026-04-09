import { env } from "../../config/env.js";

export function toPublicMediaUrl(storageKey) {
  const key = String(storageKey || "").trim().replace(/^\/+/, "");
  if (!key) return null;
  const base = String(env.OBJECT_STORAGE_PUBLIC_BASE_URL || "").trim().replace(/\/+$/, "");
  if (!base) return null;
  return `${base}/${key}`;
}
