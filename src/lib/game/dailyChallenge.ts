import { PUZZLE_LEVELS } from "@/data/puzzles";
import { TIERS } from "@/lib/tiers";
import type { Puzzle } from "@/types";

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Deterministically picks one puzzle per day from whatever tiers the
 * player has unlocked so far, so the "Daily Challenge" card always has
 * something playable and changes at midnight UTC.
 */
export function getDailyPuzzle(xp: number, dateIso = new Date().toISOString().slice(0, 10)): Puzzle {
  const unlockedTierIds = TIERS.filter((t) => xp >= t.xpRequired).map((t) => t.id);
  const pool: Puzzle[] = PUZZLE_LEVELS.filter((l) => unlockedTierIds.includes(l.id)).flatMap(
    (l) => l.puzzles
  );
  const source = pool.length > 0 ? pool : PUZZLE_LEVELS[0].puzzles;
  const idx = hashString(dateIso) % source.length;
  return source[idx];
}
