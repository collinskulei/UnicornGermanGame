import type { TierDef } from "@/types";

/**
 * All reward-economy math lives here so it's tunable in one place.
 * Formulas are intentionally simple integer arithmetic — no floating
 * surprises, easy to reason about, easy to display "how you got this
 * score" breakdowns in the UI.
 */

const BASE_SCORE = 1000;
const TIME_PENALTY_PER_SECOND = 2;
const PERFECT_ACCURACY_BONUS = 200;
const HINT_PENALTY = 40;
const MIN_SCORE = 50; // completing a puzzle always earns *something*

export interface ScoreInput {
  accuracy: number; // 0-100
  timeSeconds: number;
  hintsUsed: number;
}

export function computeScore({ accuracy, timeSeconds, hintsUsed }: ScoreInput): number {
  const accuracyPortion = (accuracy / 100) * BASE_SCORE;
  const timePenalty = Math.min(timeSeconds, 600) * TIME_PENALTY_PER_SECOND;
  const hintPenalty = hintsUsed * HINT_PENALTY;
  const perfectBonus = accuracy === 100 ? PERFECT_ACCURACY_BONUS : 0;

  const raw = accuracyPortion - timePenalty - hintPenalty + perfectBonus;
  return Math.max(MIN_SCORE, Math.round(raw));
}

export interface RewardResult {
  xpEarned: number;
  coinsEarned: number;
  score: number;
  speedBonus: boolean;
  perfectRun: boolean;
}

const SPEED_BONUS_SECONDS = 90;

export function computeRewards(
  input: ScoreInput,
  tier: TierDef,
  opts: { isDailyChallenge?: boolean } = {}
): RewardResult {
  const score = computeScore(input);
  const perfectRun = input.accuracy === 100 && input.hintsUsed === 0;
  const speedBonus = input.timeSeconds <= SPEED_BONUS_SECONDS;

  // XP scales gently with tier so higher levels feel more rewarding,
  // matching the extra vocabulary difficulty.
  const tierMultiplier = 1 + (tier.levelNumber - 1) * 0.25;

  let xpEarned = Math.round((score / 10) * tierMultiplier);
  let coinsEarned = Math.round(score / 40);

  if (perfectRun) {
    xpEarned += 30;
    coinsEarned += 10;
  }
  if (speedBonus) {
    xpEarned += 15;
  }
  if (opts.isDailyChallenge) {
    xpEarned = Math.round(xpEarned * 1.5);
    coinsEarned += 20;
  }

  return { xpEarned, coinsEarned, score, speedBonus, perfectRun };
}

// --- Streaks ---

export function isConsecutiveDay(lastPlayedIso: string | null, todayIso: string): "same" | "consecutive" | "broken" {
  if (!lastPlayedIso) return "broken";
  if (lastPlayedIso === todayIso) return "same";

  const last = new Date(lastPlayedIso + "T00:00:00Z");
  const today = new Date(todayIso + "T00:00:00Z");
  const diffDays = Math.round((today.getTime() - last.getTime()) / 86_400_000);

  return diffDays === 1 ? "consecutive" : "broken";
}

export function nextStreakValue(currentStreak: number, lastPlayedIso: string | null, todayIso: string): number {
  const status = isConsecutiveDay(lastPlayedIso, todayIso);
  if (status === "same") return currentStreak;
  if (status === "consecutive") return currentStreak + 1;
  return 1; // broken or first-ever play
}

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];
