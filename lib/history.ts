import type { GameState, ManualPressure } from "@/lib/types";

export const HISTORY_KEY = "quickdraft:history:v1";
export const ACTIVE_DRAFT_KEY = "quickdraft:active:v1";
export const HISTORY_LIMIT = 8;

export type DraftSnapshot = {
  id: string;
  championIds: string[];
  state: GameState;
  pressure: ManualPressure;
  savedAt: string;
};

export function snapshotKey(snapshot: Omit<DraftSnapshot, "id" | "savedAt">) {
  return [
    snapshot.championIds.join(","),
    snapshot.state,
    snapshot.pressure.burst ? "b1" : "b0",
    snapshot.pressure.hardCc ? "c1" : "c0",
    snapshot.pressure.healing ? "h1" : "h0",
  ].join("|");
}

export function newSnapshot(snapshot: Omit<DraftSnapshot, "id" | "savedAt">): DraftSnapshot {
  return {
    ...snapshot,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt: new Date().toISOString(),
  };
}

export function parseSnapshots(raw: string | null): DraftSnapshot[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter((entry): entry is DraftSnapshot =>
      entry && Array.isArray(entry.championIds) && typeof entry.state === "string" && entry.pressure && typeof entry.savedAt === "string",
    );
  } catch {
    return [];
  }
}
