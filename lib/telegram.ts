import { createHmac, timingSafeEqual } from "node:crypto";

export type TelegramWebApp = {
  ready: () => void;
  expand: () => void;
  initData: string;
  initDataUnsafe?: { start_param?: string; user?: { id?: number } };
  themeParams?: Record<string, string>;
  HapticFeedback?: { selectionChanged?: () => void; impactOccurred?: (style: string) => void };
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function normalizeSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function parseComp(value?: string | null) {
  if (!value) return [];
  return value
    .split(/[,_|;+]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, 5);
}

export function validateTelegramInitData(initData: string, botToken: string, maxAgeSeconds = 86_400) {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash || !/^[a-f0-9]{64}$/i.test(hash)) return { valid: false as const, reason: "missing hash" };

  params.delete("hash");
  params.delete("signature");
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const expected = createHmac("sha256", secretKey).update(dataCheckString).digest();
  const actual = Buffer.from(hash, "hex");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return { valid: false as const, reason: "invalid hash" };

  const authDate = Number(params.get("auth_date") ?? 0);
  if (!authDate || Date.now() / 1000 - authDate > maxAgeSeconds) return { valid: false as const, reason: "expired" };

  let userId: number | undefined;
  const user = params.get("user");
  if (user) {
    try { userId = JSON.parse(user).id; } catch { /* ignore malformed user */ }
  }
  return { valid: true as const, userId };
}
