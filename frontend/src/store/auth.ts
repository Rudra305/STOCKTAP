import * as Crypto from "expo-crypto";

import { storage } from "@/src/utils/storage";

const PIN_HASH_KEY = "stocktap.pin.hash";
const SESSION_KEY = "stocktap.session.active";

async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `stocktap:${pin}`,
  );
}

export async function hasPin(): Promise<boolean> {
  const existing = await storage.secureGet<string>(PIN_HASH_KEY, "");
  return typeof existing === "string" && existing.length > 0;
}

export async function setPin(pin: string): Promise<boolean> {
  if (!/^\d{4}$/.test(pin)) return false;
  const hash = await hashPin(pin);
  const ok = await storage.secureSet(PIN_HASH_KEY, hash);
  if (ok) await storage.setItem(SESSION_KEY, true);
  return ok;
}

export async function verifyPin(pin: string): Promise<boolean> {
  if (!/^\d{4}$/.test(pin)) return false;
  const stored = await storage.secureGet<string>(PIN_HASH_KEY, "");
  if (!stored) return false;
  const attempt = await hashPin(pin);
  if (attempt === stored) {
    await storage.setItem(SESSION_KEY, true);
    return true;
  }
  return false;
}

export async function isSessionActive(): Promise<boolean> {
  const active = await storage.getItem<boolean>(SESSION_KEY, false);
  return !!active;
}

export async function endSession(): Promise<void> {
  await storage.removeItem(SESSION_KEY);
}
