import type { BuildItem, ItemId } from "@/lib/types";

export const ITEMS: Record<ItemId, BuildItem> = {
  berserkers: { id: "berserkers", short: "BG", name: "Berserker's Greaves", role: "early AS + movement" },
  "mercurys-treads": { id: "mercurys-treads", short: "MT", name: "Mercury's Treads", role: "tenacity + MR" },
  magnetic: { id: "magnetic", short: "MB", name: "Magnetic Blaster", role: "core range + crit" },
  kraken: { id: "kraken", short: "KS", name: "Kraken Slayer", role: "cheap tempo DPS" },
  bork: { id: "bork", short: "BORK", name: "Blade of the Ruined King", role: "HP shred + chase" },
  bloodthirster: { id: "bloodthirster", short: "BT", name: "Bloodthirster", role: "burst buffer + sustain" },
  "infinity-edge": { id: "infinity-edge", short: "IE", name: "Infinity Edge", role: "crit breakpoint" },
  mortal: { id: "mortal", short: "MR", name: "Mortal Reminder", role: "anti-heal + armor pen" },
  ldr: { id: "ldr", short: "LDR", name: "Lord Dominik's Regards", role: "HP/armor shred" },
  terminus: { id: "terminus", short: "TERM", name: "Terminus", role: "ramping mixed pen" },
  "guardian-angel": { id: "guardian-angel", short: "GA", name: "Guardian Angel", role: "physical dive insurance" },
  maw: { id: "maw", short: "MAW", name: "Maw of Malmortius", role: "magic burst insurance" },
  mercurial: { id: "mercurial", short: "MERC", name: "Mercurial Scimitar", role: "cleanse + MR" },
  gunmetal: { id: "gunmetal", short: "GG", name: "Gunmetal Greaves", role: "late boots upgrade" },
};
