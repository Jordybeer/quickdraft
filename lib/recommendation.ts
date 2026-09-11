import { championThreat, sumThreats } from "@/lib/champion-overrides";
import { ITEMS } from "@/lib/items";
import type { BuildItem, Champion, GameState, ManualPressure, Recommendation, ThreatTags } from "@/lib/types";

export const RULES_PATCH = "7.2e";
export const RULES_VERSION = "yunara-2026-09-12.3";

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

function scoreSecond(profile: ThreatTags, state: GameState, manual: ManualPressure) {
  const survivalPressure = profile.burst + profile.poke * 0.65 + profile.dive * 0.45;

  const bork = profile.hpPressure * 1.25
    + profile.armorPressure * 0.15
    + profile.dive * 0.18
    + (state === "behind" ? 0.2 : 0);

  const bt = survivalPressure * 0.82
    + (state === "behind" ? 1.35 : 0)
    + (profile.magicBurst + profile.physicalBurst) * 0.12
    + (manual.burst ? 0.8 : 0);

  const kraken = 4.8
    - profile.hpPressure * 0.65
    - profile.armorPressure * 0.35
    - profile.burst * 0.22
    - profile.poke * 0.15
    + (state === "ahead" ? 1.15 : 0)
    + (state === "even" ? 0.45 : -0.55)
    - (manual.burst ? 0.25 : 0);

  return { bork, bt, kraken };
}

function bootChoice(profile: ThreatTags): BuildItem {
  const extremeCcMagic = profile.hardCc >= 8 && profile.cleansableCc >= 3 && profile.magicBurst >= 2.8;
  return extremeCcMagic ? ITEMS["mercurys-treads"] : ITEMS.berserkers;
}

function bestDefense(profile: ThreatTags, manual: ManualPressure): BuildItem | null {
  const candidates: Array<{ item: BuildItem; score: number }> = [];

  if (profile.cleansableCc >= 3.5 || manual.hardCc) {
    candidates.push({
      item: ITEMS.mercurial,
      score: profile.cleansableCc * 1.05 + profile.hardCc * 0.12 + (manual.hardCc ? 2.5 : 0),
    });
  }

  if (
    profile.magicBurst >= Math.max(3.5, profile.physicalBurst + 1.2)
    || (manual.burst && profile.magicBurst >= 3)
  ) {
    candidates.push({
      item: ITEMS.maw,
      score: profile.magicBurst * 1.15 + profile.dive * 0.12 + (manual.burst ? 0.55 : 0),
    });
  }

  if (
    profile.physicalBurst + profile.dive >= 6
    || (manual.burst && profile.physicalBurst >= 3.5)
  ) {
    candidates.push({
      item: ITEMS["guardian-angel"],
      score: profile.physicalBurst * 0.75 + profile.dive * 0.45 + (manual.burst ? 0.55 : 0),
    });
  }

  return candidates.sort((a, b) => b.score - a.score)[0]?.item ?? null;
}

function penetration(profile: ThreatTags, sustainedCore: boolean, manual: ManualPressure): BuildItem | null {
  if (manual.healing || profile.healing >= 3.5) return ITEMS.mortal;
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

function uniqueStrings(values: string[]) {
  return values.filter((value, index, all) => all.indexOf(value) === index);
}

function hasPen(items: BuildItem[]) {
  return items.some((item) => PEN_IDS.has(item.id));
}

function addUnique(path: BuildItem[], item: BuildItem | null | undefined, limit = MAX_BUILD_SLOTS) {
  if (!item || path.length >= limit || path.some((candidate) => candidate.id === item.id)) return;
  if (PEN_IDS.has(item.id) && hasPen(path)) return;
  path.push(item);
}

function explainSecond(profile: ThreatTags, second: BuildItem) {
  if (second.id === "bloodthirster") {
    return "Bloodthirster wins the second-item call because their burst, poke, or dive can remove your uptime before greedier DPS pays off.";
  }
  if (second.id === "bork") {
    return "BORK wins the second-item call because their HP pressure makes repeated-hit damage worth more than the greedier tempo options.";
  }
  return "Kraken wins the second-item call because frontline pressure is light enough to cash in on its cheaper tempo DPS.";
}

function explainPen(profile: ThreatTags, pen: BuildItem | null, manual: ManualPressure) {
  if (!pen) return null;
  if (pen.id === "mortal") {
    return manual.healing
      ? "The healing override makes Mortal Reminder the penetration slot; anti-heal is now an explicit fight condition."
      : "Their sustain is high enough that Mortal Reminder should own the penetration slot.";
  }
  if (pen.id === "terminus") {
    return "Their HP plus armor profile is high enough that Terminus should arrive before the build is finished.";
  }
  return "Their likely armor stack is high enough that an armor-penetration slot should arrive before the build is finished.";
}

function explainDefense(profile: ThreatTags, defense: BuildItem | null) {
  if (!defense) return null;
  if (defense.id === "mercurial") {
    return "Mercurial is the late defensive slot because cleanseable CC is the main check on your ability to keep attacking.";
  }
  if (defense.id === "maw") {
    return "Maw is the late defensive slot because magic burst is the dominant damage check once your core is online.";
  }
  return "Guardian Angel is the late defensive slot because physical burst plus dive is a bigger death check than cleanse value alone.";
}

function buildPath(profile: ThreatTags, manual: ManualPressure, second: BuildItem, penFirstOverride?: boolean) {
  const defense = bestDefense(profile, manual);
  const damageSlotLimit = defense ? MAX_BUILD_SLOTS - 1 : MAX_BUILD_SLOTS;
  const path: BuildItem[] = [bootChoice(profile), ITEMS.magnetic, second];
  const sustainedCore = second.id === "bork" || second.id === "kraken";
  const pen = penetration(profile, sustainedCore, manual);
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

function samePath(a: BuildItem[], b: BuildItem[]) {
  return a.length === b.length && a.every((item, index) => item.id === b[index]?.id);
}

export function recommendBuild(
  champions: Champion[],
  state: GameState = "even",
  manual: ManualPressure = { hardCc: false, healing: false, burst: false },
): Recommendation {
  const base = sumThreats(champions);
  const profile = withManual(base, manual);
  const scores = scoreSecond(profile, state, manual);
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const secondKey = ranked[0][0] as "bork" | "bt" | "kraken";
  const second = secondKey === "bt" ? ITEMS.bloodthirster : ITEMS[secondKey];
  const altKey = ranked[1][0] as "bork" | "bt" | "kraken";
  const altSecond = altKey === "bt" ? ITEMS.bloodthirster : ITEMS[altKey];
  const closeSecond = ranked[1][1] >= ranked[0][1] - 0.9;

  const path = buildPath(profile, manual, second);
  const defense = bestDefense(profile, manual);
  const boot = bootChoice(profile);
  const pen = penetration(profile, second.id === "bork" || second.id === "kraken", manual);
  const qssUseful = profile.cleansableCc >= 2.5;
  const nonCleanseablePressure = profile.hardCc - profile.cleansableCc;

  const reasons: string[] = [explainSecond(profile, second)];

  if (boot.id === "mercurys-treads") {
    reasons.push("Extreme CC plus magic pressure makes Mercury's Treads worth the attack-speed tradeoff in this draft.");
  }

  const penReason = explainPen(profile, pen, manual);
  if (penReason) reasons.push(penReason);

  const defenseReason = explainDefense(profile, defense);
  if (defenseReason) reasons.push(defenseReason);

  if (qssUseful && defense?.id !== "mercurial") {
    reasons.push("QSS can still be a timing component, but cleanse value alone is not high enough to force Mercurial as the final defensive item.");
  }

  if (nonCleanseablePressure >= 2.5) {
    reasons.push(
      qssUseful
        ? "A large part of their CC still cannot be solved by QSS, so positioning remains important even if you buy the component."
        : "Most of their dangerous CC is not a good QSS solve, so spacing matters more than buying cleanse for the total CC number.",
    );
  }

  if (profile.dive >= 4 && defense?.id !== "guardian-angel") {
    reasons.push("Multiple champions want to enter your space; hit the safe target and keep mobility for the second engage.");
  }

  if (path.some((item) => item.id === "infinity-edge")) {
    reasons.push("IE remains the crit payoff instead of disappearing just because another threat check is present.");
  }

  const notes: string[] = [];

  if (qssUseful) {
    notes.push(
      defense?.id === "mercurial"
        ? "Treat QSS as a timing purchase: buy the component when cleanseable CC is already costing fights, then finish Mercurial late if cleanse remains the main survival check."
        : "QSS can be a timing purchase when cleanseable CC is costing fights; do not let that component force Mercurial if GA or Maw is the better final slot.",
    );
  }

  if (nonCleanseablePressure >= 2.5) {
    notes.push(
      qssUseful
        ? "Even with QSS, the non-cleanseable part of their CC still has to be solved with spacing and target selection."
        : "Most of this comp's CC pressure is not worth a QSS purchase by itself; spacing and target selection do more work.",
    );
  }

  if (profile.healing >= 3.5 || manual.healing) {
    notes.push("Executioner's Calling can be an early component after Magnetic or your near-finished second item if healing is already deciding fights.");
  }

  if (manual.healing && path.some((item) => item.id === "mortal")) {
    notes.push("Healing override is already covered by Mortal Reminder; it does not force a second anti-heal item.");
  }

  if (manual.burst) {
    notes.push(
      second.id === "bloodthirster"
        ? "Getting bursted is reflected directly in the second-item call: BT is being prioritized for usable uptime."
        : "Getting bursted raises BT's value, but this draft still keeps the current second item because its matchup value remains larger.",
    );
  }

  if (manual.hardCc) {
    notes.push(
      defense?.id === "mercurial"
        ? "CC decides fights is reflected in the late defense choice: Mercurial now wins the final-slot check."
        : "CC decides fights raises QSS/Mercurial value, but the final slot still follows the larger survival threat in this draft.",
    );
  }

  if (boot.id === "berserkers") {
    notes.push("Keep Berserker's at T2 while a major item completion is close; Gunmetal is usually a later luxury upgrade.");
  } else {
    notes.push("Mercury's Treads are deliberate here: the tenacity/MR trade is worth more than Berserker's extra attack speed against this unusually heavy CC + magic profile.");
  }

  let alternative: BuildItem[] | undefined;
  const orderIsClose = Boolean(pen)
    && !penetrationIsUrgent(profile)
    && (profile.armorPressure >= 2 || profile.hpPressure >= 4.5);

  if (orderIsClose) {
    alternative = buildPath(profile, manual, second, true);
  } else if (closeSecond) {
    alternative = buildPath(profile, manual, altSecond);
  }

  if (alternative && samePath(path, alternative)) alternative = undefined;

  const spread = ranked[0][1] - ranked[1][1];
  const confidence = Math.max(58, Math.min(94, Math.round(72 + spread * 7 + (champions.length === 5 ? 5 : 0))));

  return {
    path,
    alternative,
    reasons: uniqueStrings(reasons).slice(0, 6),
    notes: uniqueStrings(notes),
    profile: Object.fromEntries(Object.entries(profile).map(([key, value]) => [key, round(value)])) as ThreatTags,
    confidence,
  };
}

export function debugChampion(champion: Champion) {
  return championThreat(champion);
}
