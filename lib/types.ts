export type Role = "tank" | "fighter" | "assassin" | "mage" | "marksman" | "support" | string;

export type Champion = {
  id: string;
  key?: number | string;
  hero_id?: number | string;
  name: string;
  title?: string;
  roles: Role[];
  lanes?: string[];
  difficult?: number;
  damage?: number;
  survive?: number;
  utility?: number;
  is_wr?: boolean;
};

export type ThreatTags = {
  frontline: number;
  healing: number;
  hardCc: number;
  burst: number;
  poke: number;
  dive: number;
  magicBurst: number;
  physicalBurst: number;
};

export type GameState = "behind" | "even" | "ahead";

export type ManualPressure = {
  hardCc: boolean;
  healing: boolean;
  burst: boolean;
};

export type ItemId =
  | "berserkers"
  | "magnetic"
  | "kraken"
  | "bork"
  | "bloodthirster"
  | "infinity-edge"
  | "mortal"
  | "ldr"
  | "terminus"
  | "guardian-angel"
  | "maw"
  | "mercurial"
  | "gunmetal";

export type BuildItem = {
  id: ItemId;
  short: string;
  name: string;
  role: string;
};

export type Recommendation = {
  path: BuildItem[];
  alternative?: BuildItem[];
  reasons: string[];
  notes: string[];
  profile: ThreatTags;
  confidence: number;
};
