import { championThreat, sumThreats } from "@/lib/champion-overrides";
import { ITEMS } from "@/lib/items";
import type { BuildItem, Champion, GameState, ManualPressure, Recommendation, ThreatTags } from "@/lib/types";

export const RULES_PATCH = "7.2e";
export const RULES_VERSION = "yunara-2026-09-11.2";

const MAX_BUILD_SLOTS = 6; // boots + five completed items
const PEN_IDS = new Set(["mortal", "ldr", "terminus"]);
const round = (value: number) => Math.round(value * 10) / 10;

function withManual(profile: ThreatTags, manual: ManualPressure): ThreatTags {
  return {
    ...profile,
    hardCc: profile.hardCc + (manual.hardCc ? 2 : 0),
    cleansableCc: profile.cleansableCc + (manual.hardCc ? 0.8 : 0),
    healing: profile.healing + (manual.healing ? 2 : 0),
    burst: profile.burst + (manual.burst ? 2 : 0),
  };
}

function scoreSecond(profile: ThreatTags, state: GameState) {
  const survivalPressure = profile.burst + profile.poke * 0.65 + profile.dive * 0.45;

  const bork = profile.hpPressure * 1.25 + profile.armorPressure * 0.15 + profile.dive * 0.18 + (state === "behind" ? 0.25 : 0);
  const bt = survivalPressure * 0.82 + (state === "behind" ? 1.1 : 0) + (profile.magicBurst + profile.physicalBurst) * 0.12;
  const kraken = 4.8 - profile.hpPressure * 0.65 - profile.armorPressure * 0.35 - profile.burst * 0.22 - profile.poke * 0.15
    + (state === "ahead" ? 1 : 0) + (state === "even" ? 0.45 : -0.45);

  return { bork, bt, kraken };
}

function bestDefense(profile: ThreatTags): BuildItem | null {
  if (profile.cleansableCc >= 3.5) return ITEMS.mercurial;
  if (profile.magicBurst >= Math.max(3.5, profile.physicalBurst + 1.2)) return ITEMS.maw;
  if (profile.physicalBurst + profile.dive >= 6) return ITEMS["guardian-angel"];
  return null;
}

function penetration(profile: ThreatTags, sustainedCore: boolean): BuildItem | null {
  if (profile.healing >= 3.5) return ITEMS.mortal;
  if (sustainedCore && profile.hpPressure >= 4.2 && profile.armorPressure >= 2) return ITEMS.terminus;
  if (profile.armorPressure >= 2.6) return ITEMS.ldr;
  return null;
}

function penetrationIsUrgent(profile: ThreatTags) {
  return profile.armorPressure >= 4 || (profile.hpPressure >= 7 && profile.armorPressure >= 2.8);
}

function dedupe(items: BuildItem[]) {
  return items.filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index);
}

function hasPen(items: BuildItem[]) {
  return items.some((item) => PEN_IDS.has(item.id));
}

function addUnique(path: BuildItem[], item: BuildItem | null | undefined, limit = MAX_BUILD_SLOTS) {
  if (!item || path.length >= limit || path.some((candidate) => candidate.id === item.id)) return;
  if (PEN_IDS.has(item.id) && hasPen(path)) return;
  path.push(item);
}

function explainEnemies(champions: Champion[], profile: ThreatTags) {
  const reasons: string[] = [];
  if (profile.hpPressure >= 4) reasons.push("They have enough high-HP durability that BORK-style repeated-hit damage has real value.");
  if (profile.armorPressure >= 3) reasons.push("Their likely armor stack is high enough that a penetration slot should arrive before the build is finished.");
  if (profile.healing >= 3.5) reasons.push("Their sustain is high enough that anti-heal deserves the penetration slot.");
  if (profile.cleansableCc >= 3.5) reasons.push("A meaningful part of their CC is cleanseable; QSS can preserve more uptime than rushing another full defensive item.");
  if (profile.hardCc - profile.cleansableCc >= 2.5) reasons.push("They also have substantial CC that a cleanse cannot fully solve, so positioning still matters after QSS.");
  if (profile.burst + profile.poke >= 5.5) reasons.push("The comp can remove your uptime before you ramp, so survival has real offensive value.");
  if (profile.dive >= 4) reasons.push("Multiple champions want to enter your space; hit the safe target and keep mobility for the second engage.");

  if (!reasons.length && champions.length >= 4) reasons.push("The enemy profile is relatively light on forced defensive checks, so you can bias toward tempo damage.");
  return reasons;
}

function buildPath(profile: ThreatTags, second: BuildItem, penFirstOverride?: boolean) {
  const defense = bestDefense(profile);
  const damageSlotLimit = defense ? MAX_BUILD_SLOTS - 1 : MAX_BUILD_SLOTS;
  const path: BuildItem[] = [ITEMS.berserkers, ITEMS.magnetic, second];
  const sustainedCore = second.id === "bork" || second.id === "kraken";
  const pen = penetration(profile, sustainedCore);
  const penFirst = penFirstOverride ?? penetrationIsUrgent(profile);

  // Kraken is a tempo branch; against clearly durable teams it needs BORK before the crit payoff.
  if (second.id === "kraken" && profile.hpPressure >= 4.8) addUnique(path, ITEMS.bork, damageSlotLimit);

  if (penFirst) addUnique(path, pen, damageSlotLimit);
  addUnique(path, ITEMS["infinity-edge"], damageSlotLimit);
  if (!penFirst) addUnique(path, pen, damageSlotLimit);

  // Fill remaining damage slots without stacking multiple penetration systems.
  const survivalPressure = profile.burst + profile.poke * 0.65 + profile.dive * 0.45;
  const fillers: BuildItem[] = [];
  if (survivalPressure >= 2.8 && second.id !== "bloodthirster") fillers.push(ITEMS.bloodthirster);
  if (profile.hpPressure >= 2.5 && second.id !== "bork") fillers.push(ITEMS.bork);
  if (profile.hpPressure < 2.5 && second.id !== "kraken") fillers.push(ITEMS.kraken);
  if (second.id !== "bloodthirster") fillers.push(ITEMS.bloodthirster);
  if (second.id !== "bork") fillers.push(ITEMS.bork);
  if (second.id !== "kraken") fillers.push(ITEMS.kraken);

  for (const item of fillers) addUnique(path, item, damageSlotLimit);
  addUnique(path, defense, MAX_BUILD_SLOTS);

  return dedupe(path).slice(0, MAX_BUILD_SLOTS);
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
  const altKey = ranked[1][0] as "bork" | "bt" | "kraken";
  const altSecond = altKey === "bt" ? ITEMS.bloodthirster : ITEMS[altKey];
  const closeSecond = ranked[1][1] >= ranked[0][1] - 1.15;

  const reasons = explainEnemies(champions, profile);
  const notes: string[] = [];
  const path = buildPath(profile, second);
  const pen = penetration(profile, second.id === "bork" || second.id === "kraken");

  if (second.id === "kraken" && path.some((item) => item.id === "bork")) {
    reasons.push("Kraken keeps the cheap second-item tempo; BORK then patches the high-HP matchup before later scaling.");
  }
  if (path.some((item) => item.id === "infinity-edge")) {
    reasons.push("IE remains a crit payoff instead of disappearing just because the enemy has frontline.");
  }

  if (profile.cleansableCc >= 2.5) notes.push("Treat QSS as a timing purchase: buy the component when cleanseable CC is already costing fights, then finish Mercurial in a late slot.");
  if (profile.hardCc - profile.cleansableCc >= 2.5) notes.push("Do not overpay for cleanse against the parts of their CC that QSS cannot solve; spacing still does the work there.");
  if (profile.healing >= 3.5) notes.push("Executioner's Calling can be an early component after Magnetic/your near-finished second item if healing is already deciding fights.");
  notes.push("Keep Berserker's at T2 while a major item completion is close; Gunmetal is usually a later luxury upgrade.");

  let alternative: BuildItem[] | undefined;
  const orderIsClose = Boolean(pen) && !penetrationIsUrgent(profile) && (profile.armorPressure >= 2 || profile.hpPressure >= 4.5);
  if (orderIsClose) {
    alternative = buildPath(profile, second, true);
  } else if (closeSecond) {
    alternative = buildPath(profile, altSecond);
  }

  const spread = ranked[0][1] - ranked[1][1];
  const confidence = Math.max(58, Math.min(94, Math.round(72 + spread * 7 + (champions.length === 5 ? 5 : 0))));

  return {
    path,
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
