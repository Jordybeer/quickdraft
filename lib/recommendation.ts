import { championThreat, sumThreats } from "@/lib/champion-overrides";
import { ITEMS } from "@/lib/items";
import type { BuildItem, Champion, GameState, ManualPressure, Recommendation, ThreatTags } from "@/lib/types";

export const RULES_PATCH = "7.2e";
export const RULES_VERSION = "yunara-2026-09-11.1";

const round = (value: number) => Math.round(value * 10) / 10;

function withManual(profile: ThreatTags, manual: ManualPressure): ThreatTags {
  return {
    ...profile,
    hardCc: profile.hardCc + (manual.hardCc ? 2 : 0),
    healing: profile.healing + (manual.healing ? 2 : 0),
    burst: profile.burst + (manual.burst ? 2 : 0),
  };
}

function scoreSecond(profile: ThreatTags, state: GameState) {
  const durability = profile.frontline;
  const survivalPressure = profile.burst + profile.poke * 0.65 + profile.dive * 0.45;

  const bork = durability * 1.35 + profile.dive * 0.35 + (state === "behind" ? 0.25 : 0);
  const bt = survivalPressure * 0.85 + (state === "behind" ? 1.1 : 0) + (profile.magicBurst + profile.physicalBurst) * 0.12;
  const kraken = 4.6 - durability * 0.9 - profile.burst * 0.25 - profile.poke * 0.18 + (state === "ahead" ? 1 : 0) + (state === "even" ? 0.45 : -0.45);

  return { bork, bt, kraken };
}

function bestDefense(profile: ThreatTags): BuildItem | null {
  if (profile.hardCc >= 4.5) return ITEMS.mercurial;
  if (profile.magicBurst >= Math.max(3.2, profile.physicalBurst + 1)) return ITEMS.maw;
  if (profile.physicalBurst + profile.dive >= 5.5) return ITEMS["guardian-angel"];
  return null;
}

function penetration(profile: ThreatTags, onHitCore: boolean): BuildItem | null {
  if (profile.healing >= 3.5) return ITEMS.mortal;
  if (onHitCore && profile.frontline >= 3.2) return ITEMS.terminus;
  if (profile.frontline >= 3.3) return ITEMS.ldr;
  return null;
}

function dedupe(items: BuildItem[]) {
  return items.filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index);
}

function explainEnemies(champions: Champion[], profile: ThreatTags) {
  const reasons: string[] = [];
  if (profile.frontline >= 3.3) reasons.push("You have enough durable targets that repeated-hit / HP-shred value matters.");
  if (profile.healing >= 3.5) reasons.push("Their sustain is high enough that anti-heal deserves a real slot.");
  if (profile.hardCc >= 4.5) reasons.push("Hard CC is a primary failure mode; a cleanse can create more DPS than another damage item.");
  if (profile.burst + profile.poke >= 5.5) reasons.push("The comp can remove your uptime before you ramp, so survival has real offensive value.");
  if (profile.dive >= 4) reasons.push("Multiple champions want to enter your space; hit the safe target and keep mobility for the second engage.");

  if (!reasons.length && champions.length >= 4) reasons.push("The enemy profile is relatively light on forced defensive checks, so you can bias toward tempo damage.");
  return reasons;
}

export function recommendBuild(
  champions: Champion[],
  state: GameState = "even",
  manual: ManualPressure = { hardCc: false, healing: false, burst: false },
): Recommendation {
  const base = sumThreats(champions);
  const profile = withManual(base, manual);
  const scores = scoreSecond(profile, state);
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const secondKey = ranked[0][0] as "bork" | "bt" | "kraken";
  const second = secondKey === "bt" ? ITEMS.bloodthirster : ITEMS[secondKey];
  const closeAlternative = ranked[1][1] >= ranked[0][1] - 1.15;
  const altKey = ranked[1][0] as "bork" | "bt" | "kraken";
  const altSecond = altKey === "bt" ? ITEMS.bloodthirster : ITEMS[altKey];

  const path: BuildItem[] = [ITEMS.berserkers, ITEMS.magnetic, second];
  const notes: string[] = [];
  const reasons = explainEnemies(champions, profile);

  const defense = bestDefense(profile);
  const onHitCore = second.id === "bork" || second.id === "kraken";
  const pen = penetration(profile, second.id === "bork" && profile.frontline >= 4.5);

  if (second.id === "kraken") {
    if (profile.frontline >= 4.2) {
      path.push(ITEMS.bork);
      reasons.push("Kraken keeps the cheap second-item tempo; BORK then patches the bruiser/frontline problem.");
    } else {
      path.push(ITEMS["infinity-edge"]);
      reasons.push("Kraken skips crit, so IE third restores a 50% crit breakpoint with Magnetic and cashes in the midgame spike.");
    }
  } else if (pen) {
    path.push(pen);
  } else if (profile.frontline < 3.1) {
    path.push(ITEMS["infinity-edge"]);
  } else {
    path.push(ITEMS.mortal);
  }

  if (!path.some((item) => item.id === "infinity-edge") && profile.frontline < 5.3) path.push(ITEMS["infinity-edge"]);

  if (path.some((item) => item.id === "kraken") && path.some((item) => item.id === "bork") && profile.frontline >= 3.2 && !pen && !path.some((item) => ["mortal", "ldr"].includes(item.id))) {
    path.push(ITEMS.terminus);
    reasons.push("Kraken + BORK creates a sustained on-hit core; Terminus is the mixed-penetration branch when fights last long enough to stack it.");
  }

  if (pen && !path.some((item) => item.id === pen.id)) path.push(pen);
  if (defense) path.push(defense);
  if (!path.some((item) => item.id === "bork") && profile.frontline >= 3.6) path.push(ITEMS.bork);

  if (profile.healing >= 3.5 && !path.some((item) => item.id === "mortal")) {
    const terminusIndex = path.findIndex((item) => item.id === "terminus");
    if (terminusIndex >= 0) path.splice(terminusIndex, 1, ITEMS.mortal);
    else path.push(ITEMS.mortal);
  }

  if (profile.hardCc >= 4.5) notes.push("Buy QSS early if one CC chain is already costing fights; finish Mercurial later.");
  if (profile.healing >= 3.5) notes.push("Executioner's Calling can be an early component after Magnetic/your near-finished second item if healing is already deciding fights.");
  notes.push("Keep Berserker's at T2 while a major item completion is close; Gunmetal is usually a later luxury upgrade.");

  const trimmed = dedupe(path).slice(0, 7);

  let alternative: BuildItem[] | undefined;
  if (closeAlternative) {
    const alt: BuildItem[] = [ITEMS.berserkers, ITEMS.magnetic, altSecond];
    if (altSecond.id === "kraken") alt.push(profile.frontline >= 4.2 ? ITEMS.bork : ITEMS["infinity-edge"]);
    else if (profile.healing >= 3.5) alt.push(ITEMS.mortal);
    else if (profile.frontline >= 3.3) alt.push(ITEMS.ldr);
    else alt.push(ITEMS["infinity-edge"]);
    alternative = dedupe(alt);
  }

  const spread = ranked[0][1] - ranked[1][1];
  const confidence = Math.max(58, Math.min(94, Math.round(72 + spread * 7 + (champions.length === 5 ? 5 : 0))));

  return {
    path: trimmed,
    alternative,
    reasons: reasons.slice(0, 4),
    notes,
    profile: Object.fromEntries(Object.entries(profile).map(([key, value]) => [key, round(value)])) as ThreatTags,
    confidence,
  };
}

export function debugChampion(champion: Champion) {
  return championThreat(champion);
}
