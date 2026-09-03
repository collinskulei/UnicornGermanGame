import type { TierDef, TierId } from "@/types";

// Avatar-evolution tiers double as puzzle difficulty levels. Reaching a
// tier's XP threshold both evolves the player's unicorn AND unlocks that
// difficulty's puzzles. This is the spine of the progression system —
// see DESIGN_SYSTEM.md section 7.
export const TIERS: TierDef[] = [
  {
    id: "foal",
    levelNumber: 1,
    cefr: "A1",
    displayName: "Foal",
    tagline: "Wobbly first steps into German",
    xpRequired: 0,
    color: "tier-foal",
  },
  {
    id: "colt",
    levelNumber: 2,
    cefr: "A2",
    displayName: "Colt",
    tagline: "Finding your footing",
    xpRequired: 500,
    color: "tier-colt",
  },
  {
    id: "stallion",
    levelNumber: 3,
    cefr: "B1",
    displayName: "Stallion",
    tagline: "Confident and quick",
    xpRequired: 1400,
    color: "tier-stallion",
  },
  {
    id: "pegasus",
    levelNumber: 4,
    cefr: "B2",
    displayName: "Pegasus",
    tagline: "Taking flight into fluency",
    xpRequired: 2800,
    color: "tier-pegasus",
  },
  {
    id: "alicorn",
    levelNumber: 5,
    cefr: "C1",
    displayName: "Alicorn",
    tagline: "Legendary command of German",
    xpRequired: 5000,
    color: "tier-alicorn-a",
  },
];

export function getTier(id: TierId): TierDef {
  const tier = TIERS.find((t) => t.id === id);
  if (!tier) throw new Error(`Unknown tier: ${id}`);
  return tier;
}

export function tierForXp(xp: number): TierDef {
  let current = TIERS[0];
  for (const tier of TIERS) {
    if (xp >= tier.xpRequired) current = tier;
  }
  return current;
}

export function nextTier(current: TierId): TierDef | null {
  const idx = TIERS.findIndex((t) => t.id === current);
  return TIERS[idx + 1] ?? null;
}

export function isTierUnlocked(tierId: TierId, xp: number): boolean {
  return xp >= getTier(tierId).xpRequired;
}

export function xpProgressWithinTier(xp: number): {
  tier: TierDef;
  next: TierDef | null;
  xpIntoTier: number;
  xpForNextTier: number; // span of the current tier band
  fraction: number; // 0-1 progress toward next tier
} {
  const tier = tierForXp(xp);
  const next = nextTier(tier.id);
  if (!next) {
    return { tier, next: null, xpIntoTier: xp - tier.xpRequired, xpForNextTier: 0, fraction: 1 };
  }
  const span = next.xpRequired - tier.xpRequired;
  const into = xp - tier.xpRequired;
  return {
    tier,
    next,
    xpIntoTier: into,
    xpForNextTier: span,
    fraction: Math.min(1, into / span),
  };
}
