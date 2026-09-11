import { RULES_PATCH, RULES_VERSION } from "@/lib/recommendation";

const PATCH_INDEX_URL = "https://wildrift.leagueoflegends.com/en-us/news/tags/patch-notes/";
const PATCH_RE = /Wild Rift Patch Notes\s+([0-9]+\.[0-9]+[a-z]?)/gi;

function patchWeight(patch: string) {
  const match = patch.match(/^(\d+)\.(\d+)([a-z])?$/i);
  if (!match) return -1;
  const [, major, minor, letter] = match;
  return Number(major) * 10000 + Number(minor) * 100 + (letter ? letter.toLowerCase().charCodeAt(0) - 96 : 0);
}

export async function fetchPatchStatus(force = false) {
  try {
    const response = await fetch(PATCH_INDEX_URL, force ? { cache: "no-store" } : { next: { revalidate: 3_600, tags: ["patch-status"] } });
    if (!response.ok) throw new Error(`patch source ${response.status}`);
    const html = await response.text();
    const matches = [...html.matchAll(PATCH_RE)].map((match) => match[1]);
    const latest = [...new Set(matches)].sort((a, b) => patchWeight(b) - patchWeight(a))[0] ?? RULES_PATCH;
    return {
      ok: true,
      latest,
      rulesPatch: RULES_PATCH,
      rulesVersion: RULES_VERSION,
      stale: patchWeight(latest) > patchWeight(RULES_PATCH),
      source: PATCH_INDEX_URL,
    };
  } catch {
    return {
      ok: false,
      latest: RULES_PATCH,
      rulesPatch: RULES_PATCH,
      rulesVersion: RULES_VERSION,
      stale: false,
      source: PATCH_INDEX_URL,
    };
  }
}
