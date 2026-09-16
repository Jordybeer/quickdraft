import type { Champion, ThreatTags } from "@/lib/types";

type ChampionProfile = Partial<ThreatTags> & {
  /** Legacy durability shorthand used by the hand-tuned profiles. It is decomposed, not added to role baselines. */
  frontline?: number;
};

const zero = (): ThreatTags => ({
  hpPressure: 0,
  armorPressure: 0,
  healing: 0,
  hardCc: 0,
  cleansableCc: 0,
  burst: 0,
  poke: 0,
  dive: 0,
  magicBurst: 0,
  physicalBurst: 0,
});

const add = (target: ThreatTags, patch: Partial<ThreatTags>) => {
  for (const [key, value] of Object.entries(patch)) {
    target[key as keyof ThreatTags] += value ?? 0;
  }
};

const overrides: Record<string, ChampionProfile> = {
  Aatrox: { frontline: 1.5, healing: 2, dive: 1 },
  Ahri: { hardCc: 1.5, cleansableCc: 1.5, burst: 2, dive: 1.2, magicBurst: 2 },
  Akali: { burst: 2, dive: 2, magicBurst: 2 },
  Alistar: { frontline: 2, hardCc: 2, cleansableCc: 0.7, dive: 1 },
  Annie: { hardCc: 1.5, cleansableCc: 1.2, burst: 2, magicBurst: 2 },
  Ashe: { hardCc: 2, cleansableCc: 2, poke: 1 },
  Blitzcrank: { frontline: 1.5, hardCc: 2, cleansableCc: 0.8 },
  Brand: { hardCc: 1, cleansableCc: 0.7, burst: 1.5, poke: 2, magicBurst: 2 },
  Braum: { frontline: 2, hardCc: 1.5, cleansableCc: 0.7 },
  Caitlyn: { poke: 2, physicalBurst: 1 },
  Camille: { frontline: 1, hardCc: 1, cleansableCc: 0.6, dive: 2, physicalBurst: 1 },
  Chogath: { frontline: 2.5, hpPressure: 2.8, armorPressure: 1.2, hardCc: 1.5, cleansableCc: 0.5, burst: 1 },
  Diana: { burst: 2, dive: 2, magicBurst: 2 },
  DrMundo: { frontline: 2.5, hpPressure: 3, armorPressure: 0.7, healing: 2 },
  Draven: { burst: 1.5, physicalBurst: 2 },
  Ekko: { burst: 2, dive: 2, magicBurst: 2 },
  Evelynn: { burst: 2, dive: 2, magicBurst: 2 },
  Ezreal: { poke: 2 },
  Fizz: { burst: 2, dive: 2, magicBurst: 2 },
  Galio: { frontline: 2, hardCc: 2, cleansableCc: 0.7, magicBurst: 1 },
  Garen: { frontline: 1.5, burst: 1, physicalBurst: 1 },
  Graves: { burst: 2, physicalBurst: 2 },
  Gwen: { frontline: 1, healing: 1, dive: 1, magicBurst: 1 },
  Hecarim: { frontline: 1, hardCc: 1, cleansableCc: 0.3, dive: 2, physicalBurst: 1 },
  Irelia: { frontline: 1, healing: 1.5, hardCc: 1, cleansableCc: 0.8, dive: 2, physicalBurst: 1 },
  Janna: { hardCc: 1.5, cleansableCc: 0.5, healing: 1 },
  JarvanIV: { frontline: 1.5, hardCc: 1.5, cleansableCc: 0.4, dive: 2 },
  Jhin: { hardCc: 1, cleansableCc: 0.8, burst: 1.5, poke: 1.5, physicalBurst: 2 },
  Jinx: { poke: 1, physicalBurst: 1 },
  Kassadin: { burst: 2.5, dive: 2.5, magicBurst: 2.5 },
  Katarina: { burst: 2, dive: 2, magicBurst: 2 },
  Khazix: { burst: 2.5, dive: 2, physicalBurst: 2.5 },
  Kindred: { physicalBurst: 1, dive: 0.5 },
  Leona: { frontline: 2, hardCc: 2.5, cleansableCc: 1.8, dive: 2 },
  LeeSin: { hardCc: 1, cleansableCc: 0.2, dive: 2, physicalBurst: 1.5 },
  Lissandra: { hardCc: 2, cleansableCc: 1.1, burst: 1.5, dive: 1, magicBurst: 1.5 },
  Lucian: { burst: 1.8, poke: 0.8, dive: 0.8, physicalBurst: 2.2 },
  Lulu: { hardCc: 1.5, cleansableCc: 1.2, healing: 0.5 },
  Lux: { hardCc: 1.5, cleansableCc: 1.3, burst: 1.5, poke: 2, magicBurst: 2 },
  Malphite: { frontline: 2.5, hardCc: 2, cleansableCc: 0.2, dive: 2, magicBurst: 1 },
  Maokai: { frontline: 2.3, hpPressure: 2.4, armorPressure: 1.35, healing: 1.2, hardCc: 2.8, cleansableCc: 1.6, poke: 0.6, dive: 1.2, magicBurst: 0.7 },
  MasterYi: { dive: 2, physicalBurst: 1.5, healing: 0.5 },
  Milio: { healing: 1.5, hardCc: 0.5, cleansableCc: 0.3 },
  MonkeyKing: { frontline: 1, hardCc: 1.5, cleansableCc: 0.2, dive: 2, physicalBurst: 1 },
  Morgana: { hardCc: 2, cleansableCc: 1.8, poke: 1, magicBurst: 1 },
  Nautilus: { frontline: 2, hardCc: 2.5, cleansableCc: 1.2, dive: 1.5 },
  Nidalee: { burst: 1.5, poke: 2.5, magicBurst: 1.5 },
  Nunu: { frontline: 2, hardCc: 1.5, cleansableCc: 0.5, healing: 0.5 },
  Ornn: { frontline: 3, hpPressure: 2.6, armorPressure: 1.8, hardCc: 2, cleansableCc: 0.2 },
  Pantheon: { hardCc: 1.5, cleansableCc: 1.5, burst: 1.5, dive: 1.5, physicalBurst: 1.5 },
  Pyke: { hardCc: 1.5, cleansableCc: 0.9, burst: 1.5, dive: 1.5, physicalBurst: 1.5 },
  Rakan: { hardCc: 2, cleansableCc: 1, dive: 2 },
  Rammus: { frontline: 2.5, hpPressure: 1.8, armorPressure: 2.4, hardCc: 2, cleansableCc: 1.4, dive: 1.5 },
  Rell: { frontline: 2.2, hpPressure: 2.1, armorPressure: 1.8, hardCc: 3, cleansableCc: 0.8, dive: 1.8, magicBurst: 0.4 },
  Rengar: { burst: 2.5, dive: 2.5, physicalBurst: 2.5 },
  Riven: { frontline: 1, hardCc: 1, cleansableCc: 0.3, dive: 2, physicalBurst: 1.5 },
  Rumble: { hpPressure: 0.7, armorPressure: 0.2, hardCc: 0.8, cleansableCc: 0.5, burst: 1.2, poke: 2.2, dive: 0.5, magicBurst: 2.4 },
  Samira: { healing: 1, dive: 1.5, burst: 1, physicalBurst: 1.5 },
  Shen: { frontline: 2, hardCc: 1.5, cleansableCc: 1.1, dive: 1 },
  Shyvana: { frontline: 1.5, dive: 1 },
  Sion: { frontline: 3, hpPressure: 2.8, armorPressure: 1.5, hardCc: 2, cleansableCc: 0.3 },
  Soraka: { healing: 3 },
  Swain: { frontline: 1.5, hpPressure: 1.8, armorPressure: 0.4, healing: 2.5, hardCc: 1, cleansableCc: 0.8, magicBurst: 1 },
  Syndra: { hardCc: 1, cleansableCc: 0.8, burst: 2, poke: 1.5, magicBurst: 2 },
  Thresh: { frontline: 1, hardCc: 2.5, cleansableCc: 1.1 },
  Tristana: { burst: 1.5, dive: 1, physicalBurst: 1.5 },
  Tryndamere: { dive: 2, healing: 0.5, physicalBurst: 1.5 },
  Varus: { hardCc: 1.5, cleansableCc: 1.5, poke: 2, physicalBurst: 1 },
  Veigar: { hardCc: 1.5, cleansableCc: 1, burst: 2, magicBurst: 2 },
  Viego: { healing: 1.5, hardCc: 0.5, cleansableCc: 0.2, dive: 2, physicalBurst: 1.5 },
  Vi: { frontline: 1, hardCc: 2, cleansableCc: 0.7, dive: 2, physicalBurst: 1 },
  Vladimir: { healing: 2, burst: 1.5, magicBurst: 2 },
  Warwick: { frontline: 1, healing: 2, hardCc: 1.5, cleansableCc: 0.7, dive: 1.5 },
  Wukong: { frontline: 1, hardCc: 1.5, cleansableCc: 0.2, dive: 2, physicalBurst: 1 },
  Xayah: { physicalBurst: 1, hardCc: 0.5, cleansableCc: 0.4 },
  Yasuo: { dive: 2, hardCc: 1, cleansableCc: 0.2, physicalBurst: 1.5 },
  Yone: { dive: 2, hardCc: 1, cleansableCc: 0.2, physicalBurst: 1.5 },
  Yuumi: { healing: 2 },
  Zed: { burst: 2.5, dive: 2.5, physicalBurst: 2.5 },
  Ziggs: { poke: 2.5, magicBurst: 1 },
  Zoe: { burst: 2, poke: 2.5, magicBurst: 2 },
  Zyra: { hardCc: 1.5, cleansableCc: 1.2, poke: 2, magicBurst: 1.5 },
};

function weakRoleBaseline(champion: Champion): ThreatTags {
  const result = zero();
  const roles = champion.roles ?? [];

  if (roles.includes("tank")) {
    result.hpPressure += 0.55;
    result.armorPressure += 0.45;
    result.hardCc += 0.2;
  }
  if (roles.includes("fighter")) {
    result.hpPressure += 0.2;
    result.armorPressure += 0.1;
    result.dive += 0.15;
  }
  if (roles.includes("assassin")) {
    result.burst += 0.45;
    result.dive += 0.45;
  }
  if (roles.includes("mage") && (champion.damage ?? 0) >= 3) result.magicBurst += 0.25;
  if ((champion.survive ?? 0) >= 3) {
    result.hpPressure += 0.15;
    result.armorPressure += 0.1;
  }
  if ((champion.utility ?? 0) >= 3) result.hardCc += 0.15;

  return result;
}

function applyExplicitProfile(base: ThreatTags, profile: ChampionProfile) {
  const result = { ...base };
  const { frontline, ...explicit } = profile;

  if (frontline !== undefined) {
    result.hpPressure = explicit.hpPressure ?? frontline;
    result.armorPressure = explicit.armorPressure ?? frontline * 0.45;
  }

  for (const [key, value] of Object.entries(explicit)) {
    if (value !== undefined) result[key as keyof ThreatTags] = value;
  }

  // Unknown CC details should never make a cleanse recommendation dominate by itself.
  if (profile.hardCc !== undefined && profile.cleansableCc === undefined) {
    result.cleansableCc = profile.hardCc * 0.4;
  }

  return result;
}

export function hasExplicitThreatProfile(champion: Champion | string) {
  const id = typeof champion === "string" ? champion : champion.id;
  return Boolean(overrides[id]);
}

export function threatProfileCoverage(champions: Champion[]) {
  const fallback = champions.filter((champion) => !hasExplicitThreatProfile(champion));
  return {
    tuned: champions.length - fallback.length,
    total: champions.length,
    fallback,
  };
}

export function championThreat(champion: Champion): ThreatTags {
  const baseline = weakRoleBaseline(champion);
  const profile = overrides[champion.id];
  return profile ? applyExplicitProfile(baseline, profile) : baseline;
}

export function sumThreats(champions: Champion[]): ThreatTags {
  const total = zero();
  for (const champion of champions) add(total, championThreat(champion));
  return total;
}