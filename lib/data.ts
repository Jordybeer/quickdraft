import type { Champion } from "@/lib/types";

const CHAMPION_DATA_URL = "https://ry2x.github.io/WildRift-Merged-Champion-Data/data_en_US.json";
const META_DATA_URL = "https://ry2x.github.io/WildRift-Merged-Stats-Data/heroStats.json";

const FALLBACK_CHAMPIONS: Champion[] = [
  ["Ashe", ["marksman"]], ["Brand", ["mage", "support"]], ["Braum", ["tank", "support"]],
  ["Diana", ["fighter", "mage"]], ["Graves", ["marksman", "fighter"]], ["Irelia", ["fighter", "assassin"]],
  ["Jhin", ["marksman", "mage"]], ["Jinx", ["marksman"]], ["Kassadin", ["assassin", "mage"]],
  ["Khazix", ["assassin"]], ["Kindred", ["marksman"]], ["Leona", ["tank", "support"]],
  ["Lulu", ["support", "mage"]], ["Malphite", ["tank", "mage"]], ["Milio", ["support", "mage"]],
  ["Nidalee", ["assassin", "mage"]], ["Ornn", ["tank", "fighter"]], ["Rengar", ["assassin", "fighter"]],
  ["Riven", ["fighter", "assassin"]], ["Samira", ["marksman"]], ["Swain", ["mage", "fighter"]],
  ["Thresh", ["tank", "support"]], ["Viego", ["fighter", "assassin"]], ["Zyra", ["mage", "support"]],
].map(([id, roles]) => ({ id: id as string, name: id as string, roles: roles as string[], is_wr: true }));

export async function fetchChampions(force = false): Promise<{ champions: Champion[]; source: string; degraded: boolean }> {
  try {
    const response = await fetch(CHAMPION_DATA_URL, force ? { cache: "no-store" } : { next: { revalidate: 86_400, tags: ["champion-catalog"] } });
    if (!response.ok) throw new Error(`champion source ${response.status}`);
    const raw = (await response.json()) as Champion[];
    const champions = raw.filter((champion) => champion.is_wr !== false && champion.hero_id !== 0).sort((a, b) => a.name.localeCompare(b.name));
    if (champions.length < 50) throw new Error("champion catalog unexpectedly small");
    return { champions, source: CHAMPION_DATA_URL, degraded: false };
  } catch {
    return { champions: FALLBACK_CHAMPIONS, source: "bundled fallback", degraded: true };
  }
}

type MetaPayload = { date?: string; data?: Record<string, unknown> };

export async function fetchMetaStatus(force = false) {
  try {
    const response = await fetch(META_DATA_URL, force ? { cache: "no-store" } : { next: { revalidate: 3_600, tags: ["meta-status"] } });
    if (!response.ok) throw new Error(`meta source ${response.status}`);
    const payload = (await response.json()) as MetaPayload;
    return {
      ok: true,
      date: payload.date ?? null,
      lastModified: response.headers.get("last-modified"),
      source: META_DATA_URL,
    };
  } catch {
    return { ok: false, date: null, lastModified: null, source: META_DATA_URL };
  }
}
