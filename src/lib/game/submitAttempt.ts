import type { SupabaseClient } from "@supabase/supabase-js";
import type { AchievementDef, TierDef, TierId } from "@/types";
import { computeRewards, isConsecutiveDay, nextStreakValue, STREAK_MILESTONES } from "@/lib/rewards";
import { getTier, tierForXp } from "@/lib/tiers";
import { ACHIEVEMENTS, getAchievement } from "@/lib/achievements";

export interface SubmitAttemptInput {
  userId: string;
  tier: TierId;
  puzzleId: string;
  timeSeconds: number;
  accuracy: number;
  hintsUsed: number;
  isDailyChallenge?: boolean;
}

export interface SubmitAttemptResult {
  score: number;
  xpEarned: number;
  coinsEarned: number;
  newXp: number;
  newCoins: number;
  leveledUpTo: TierDef | null;
  streak: number;
  streakMilestoneHit: number | null;
  unlockedAchievements: AchievementDef[];
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Records a finished puzzle: writes the attempt, updates XP/coins/streak
 * on the profile, evaluates every achievement condition, and reports
 * back everything the UI needs to celebrate (level-up modal, toasts,
 * achievement badges). Called client-side right after a puzzle is
 * solved — RLS ensures a player can only ever write their own rows.
 */
export async function submitAttempt(
  supabase: SupabaseClient,
  input: SubmitAttemptInput
): Promise<SubmitAttemptResult> {
  const { userId, tier, puzzleId, timeSeconds, accuracy, hintsUsed } = input;
  const isDailyChallenge = input.isDailyChallenge ?? false;

  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select("xp, coins, current_streak, longest_streak, last_played_date")
    .eq("id", userId)
    .single();
  if (profileError || !profileRow) throw new Error("Could not load profile for reward submission.");

  const today = todayIso();
  const tierBefore = tierForXp(profileRow.xp);
  const rewards = computeRewards(
    { accuracy, timeSeconds, hintsUsed },
    getTier(tier),
    { isDailyChallenge }
  );

  const newXp = profileRow.xp + rewards.xpEarned;
  const newCoins = profileRow.coins + rewards.coinsEarned;
  const tierAfter = tierForXp(newXp);
  const leveledUpTo = tierAfter.id !== tierBefore.id ? tierAfter : null;

  const dayStatus = isConsecutiveDay(profileRow.last_played_date, today);
  const newStreak = nextStreakValue(profileRow.current_streak, profileRow.last_played_date, today);
  const newLongestStreak = Math.max(profileRow.longest_streak, newStreak);
  const streakMilestoneHit =
    dayStatus !== "same" && STREAK_MILESTONES.includes(newStreak) ? newStreak : null;

  const { error: attemptError } = await supabase.from("puzzle_attempts").insert({
    user_id: userId,
    tier,
    puzzle_id: puzzleId,
    time_seconds: timeSeconds,
    accuracy,
    hints_used: hintsUsed,
    score: rewards.score,
    is_daily_challenge: isDailyChallenge,
  });
  if (attemptError) throw attemptError;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      xp: newXp,
      coins: newCoins,
      current_streak: newStreak,
      longest_streak: newLongestStreak,
      last_played_date: today,
    })
    .eq("id", userId);
  if (updateError) throw updateError;

  const unlockedAchievements = await evaluateAchievements(supabase, {
    userId,
    tier,
    accuracy,
    timeSeconds,
    hintsUsed,
    isDailyChallenge,
    newStreak,
    leveledUpTo,
  });

  return {
    score: rewards.score,
    xpEarned: rewards.xpEarned,
    coinsEarned: rewards.coinsEarned,
    newXp,
    newCoins,
    leveledUpTo,
    streak: newStreak,
    streakMilestoneHit,
    unlockedAchievements,
  };
}

interface AchievementCtx {
  userId: string;
  tier: TierId;
  accuracy: number;
  timeSeconds: number;
  hintsUsed: number;
  isDailyChallenge: boolean;
  newStreak: number;
  leveledUpTo: TierDef | null;
}

const POLYGLOT_TIERS: Record<Exclude<TierId, "alicorn">, string> = {
  foal: "polyglot_foal",
  colt: "polyglot_colt",
  stallion: "polyglot_stallion",
  pegasus: "polyglot_pegasus",
};

async function evaluateAchievements(
  supabase: SupabaseClient,
  ctx: AchievementCtx
): Promise<AchievementDef[]> {
  const candidates = new Set<string>();

  const { count: totalAttempts } = await supabase
    .from("puzzle_attempts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", ctx.userId);
  if (totalAttempts === 1) candidates.add("first_blood");

  if (ctx.accuracy === 100) {
    candidates.add("perfectionist_1");
    const { count: perfectCount } = await supabase
      .from("puzzle_attempts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", ctx.userId)
      .eq("accuracy", 100);
    if ((perfectCount ?? 0) >= 10) candidates.add("perfectionist_10");
  }

  if (ctx.timeSeconds <= 60) candidates.add("speed_demon");

  if (ctx.hintsUsed === 0) {
    const { count: noHintCount } = await supabase
      .from("puzzle_attempts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", ctx.userId)
      .eq("hints_used", 0);
    if ((noHintCount ?? 0) >= 5) candidates.add("no_hints");
  }

  if (ctx.isDailyChallenge) {
    const { count: dailyCount } = await supabase
      .from("puzzle_attempts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", ctx.userId)
      .eq("is_daily_challenge", true);
    if ((dailyCount ?? 0) >= 5) candidates.add("daily_devotee");
  }

  for (const milestone of STREAK_MILESTONES) {
    if (ctx.newStreak >= milestone) {
      if (milestone === 3) candidates.add("streak_3");
      if (milestone === 7) candidates.add("streak_7");
      if (milestone === 30) candidates.add("streak_30");
    }
  }

  if (ctx.leveledUpTo) {
    if (ctx.leveledUpTo.id === "colt") candidates.add("level_up_colt");
    if (ctx.leveledUpTo.id === "stallion") candidates.add("level_up_stallion");
    if (ctx.leveledUpTo.id === "pegasus") candidates.add("level_up_pegasus");
    if (ctx.leveledUpTo.id === "alicorn") candidates.add("level_up_alicorn");
  }

  // Completion-based achievements: how many distinct puzzles has this
  // player finished in this tier (and overall)?
  const { count: tierCompleted } = await supabase
    .from("best_attempt_per_puzzle")
    .select("puzzle_id", { count: "exact", head: true })
    .eq("user_id", ctx.userId)
    .eq("tier", ctx.tier);
  if (ctx.tier !== "alicorn" && (tierCompleted ?? 0) >= 5) {
    candidates.add(POLYGLOT_TIERS[ctx.tier]);
  }

  const { count: totalCompleted } = await supabase
    .from("best_attempt_per_puzzle")
    .select("puzzle_id", { count: "exact", head: true })
    .eq("user_id", ctx.userId);
  if ((totalCompleted ?? 0) >= 25) candidates.add("grandmaster");

  if (candidates.size === 0) return [];

  const { data: existing } = await supabase
    .from("user_achievements")
    .select("achievement_key")
    .eq("user_id", ctx.userId);
  const existingKeys = new Set((existing ?? []).map((r) => r.achievement_key as string));

  const newKeys = [...candidates].filter((k) => !existingKeys.has(k));
  if (newKeys.length === 0) return [];

  const { error: insertError } = await supabase
    .from("user_achievements")
    .insert(newKeys.map((key) => ({ user_id: ctx.userId, achievement_key: key })));
  if (insertError) return [];

  return newKeys.map(getAchievement).filter((a): a is AchievementDef => Boolean(a));
}

export function allAchievements(): AchievementDef[] {
  return ACHIEVEMENTS;
}
