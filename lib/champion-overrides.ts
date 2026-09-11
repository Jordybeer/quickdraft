import type { Champion, ThreatTags } from "@/lib/types";

const zero = (): ThreatTags => ({
  frontline: 0,
  healing: 0,
  hardCc: 0,
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

const overrides: Record<string, Partial<ThreatTags>> = {
  Aatrox: { frontline: 1.5, healing: 2, dive: 1 },
  Akali: { burst: 2, dive: 2, magicBurst: 2 },
  Alistar: { frontline: 2, hardCc: 2, dive: 1 },
  Annie: { hardCc: 1.5, burst: 2, magicBurst: 2 },
  Ashe: { hardCc: 2, poke: 1 },
  Blitzcrank: { frontline: 1.5, hardCc: 2 },
  Brand: { hardCc: 1, burst: 1.5, poke: 2, magicBurst: 2 },
  Braum: { frontline: 2, hardCc: 1.5 },
  Caitlyn: { poke: 2, physicalBurst: 1 },
  Camille: { frontline: 1, hardCc: 1, dive: 2, physicalBurst: 1 },
  Chogath: { frontline: 2.5, hardCc: 1.5, burst: 1 },
  Diana: { burst: 2, dive: 2, magicBurst: 2 },
  DrMundo: { frontline: 2.5, healing: 2 },
  Draven: { burst: 1.5, physicalBurst: 2 },
  Ekko: { burst: 2, dive: 2, magicBurst: 2 },
  Evelynn: { burst: 2, dive: 2, magicBurst: 2 },
  Ezreal: { poke: 2 },
  Fizz: { burst: 2, dive: 2, magicBurst: 2 },
  Galio: { frontline: 2, hardCc: 2, magicBurst: 1 },
  Garen: { frontline: 1.5, burst: 1, physicalBurst: 1 },
  Graves: { burst: 2, physicalBurst: 2 },
  Gwen: { frontline: 1, healing: 1, dive: 1, magicBurst: 1 },
  Hecarim: { frontline: 1, hardCc: 1, dive: 2, physicalBurst: 1 },
  Irelia: { frontline: 1, healing: 1.5, hardCc: 1, dive: 2, physicalBurst: 1 },
  Janna: { hardCc: 1.5, healing: 1 },
  JarvanIV: { frontline: 1.5, hardCc: 1.5, dive: 2 },
  Jhin: { hardCc: 1, burst: 1.5, poke: 1.5, physicalBurst: 2 },
  Jinx: { poke: 1, physicalBurst: 1 },
  Kassadin: { burst: 2.5, dive: 2.5, magicBurst: 2.5 },
  Katarina: { burst: 2, dive: 2, magicBurst: 2 },
  Khazix: { burst: 2.5, dive: 2, physicalBurst: 2.5 },
  Kindred: { physicalBurst: 1, dive: 0.5 },
  Leona: { frontline: 2, hardCc: 2.5, dive: 2 },
  LeeSin: { hardCc: 1, dive: 2, physicalBurst: 1.5 },
  Lissandra: { hardCc: 2, burst: 1.5, dive: 1, magicBurst: 1.5 },
  Lulu: { hardCc: 1.5, healing: 0.5 },
  Lux: { hardCc: 1.5, burst: 1.5, poke: 2, magicBurst: 2 },
  Malphite: { frontline: 2.5, hardCc: 2, dive: 2, magicBurst: 1 },
  MasterYi: { dive: 2, physicalBurst: 1.5, healing: 0.5 },
  Milio: { healing: 1.5, hardCc: 0.5 },
  Morgana: { hardCc: 2, poke: 1, magicBurst: 1 },
  Nautilus: { frontline: 2, hardCc: 2.5, dive: 1.5 },
  Nidalee: { burst: 1.5, poke: 2.5, magicBurst: 1.5 },
  Nunu: { frontline: 2, hardCc: 1.5, healing: 0.5 },
  Ornn: { frontline: 3, hardCc: 2 },
  Pantheon: { hardCc: 1.5, burst: 1.5, dive: 1.5, physicalBurst: 1.5 },
  Pyke: { hardCc: 1.5, burst: 1.5, dive: 1.5, physicalBurst: 1.5 },
  Rakan: { hardCc: 2, dive: 2 },
  Rammus: { frontline: 2.5, hardCc: 2, dive: 1.5 },
  Rengar: { burst: 2.5, dive: 2.5, physicalBurst: 2.5 },
  Riven: { frontline: 1, hardCc: 1, dive: 2, physicalBurst: 1.5 },
  Samira: { healing: 1, dive: 1.5, burst: 1, physicalBurst: 1.5 },
  Shen: { frontline: 2, hardCc: 1.5, dive: 1 },
  Shyvana: { frontline: 1.5, dive: 1 },
  Sion: { frontline: 3, hardCc: 2 },
  Soraka: { healing: 3 },
  Swain: { frontline: 1.5, healing: 2.5, hardCc: 1, magicBurst: 1 },
  Syndra: { hardCc: 1, burst: 2, poke: 1.5, magicBurst: 2 },
  Thresh: { frontline: 1, hardCc: 2.5 },
  Tristana: { burst: 1.5, dive: 1, physicalBurst: 1.5 },
  Tryndamere: { dive: 2, healing: 0.5, physicalBurst: 1.5 },
  Varus: { hardCc: 1.5, poke: 2, physicalBurst: 1 },
  Veigar: { hardCc: 1.5, burst: 2, magicBurst: 2 },
  Viego: { healing: 1.5, hardCc: 0.5, dive: 2, physicalBurst: 1.5 },
  Vi: { frontline: 1, hardCc: 2, dive: 2, physicalBurst: 1 },
  Vladimir: { healing: 2, burst: 1.5, magicBurst: 2 },
  Warwick: { frontline: 1, healing: 2, hardCc: 1.5, dive: 1.5 },
  Wukong: { frontline: 1, hardCc: 1.5, dive: 2, physicalBurst: 1 },
  Xayah: { physicalBurst: 1, hardCc: 0.5 },
  Yasuo: { dive: 2, hardCc: 1, physicalBurst: 1.5 },
  Yone: { dive: 2, hardCc: 1, physicalBurst: 1.5 },
  Yuumi: { healing: 2 },
  Zed: { burst: 2.5, dive: 2.5, physicalBurst: 2.5 },
  Ziggs: { poke: 2.5, magicBurst: 1 },
  Zoe: { burst: 2, poke: 2.5, magicBurst: 2 },
  Zyra: { hardCc: 1.5, poke: 2, magicBurst: 1.5 },
};

export function championThreat(champion: Champion): ThreatTags {
  const result = zero();
  const roles = champion.roles ?? [];

  if (roles.includes("tank")) result.frontline += 1.5;
  if (roles.includes("fighter")) result.frontline += 0.5;
  if (roles.includes("assassin")) {
    result.burst += 0.8;
    result.dive += 0.8;
  }
  if (roles.includes("mage") && (champion.damage ?? 0) >= 3) result.magicBurst += 0.5;
  if ((champion.survive ?? 0) >= 3) result.frontline += 0.6;
  if ((champion.utility ?? 0) >= 3) result.hardCc += 0.4;

  add(result, overrides[champion.id] ?? {});
  return result;
}

export function sumThreats(champions: Champion[]): ThreatTags {
  const total = zero();
  for (const champion of champions) add(total, championThreat(champion));
  return total;
}
