"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { getPuzzle } from "@/data/puzzles";
import { useSwipeMatch } from "@/lib/game/useSwipeMatch";
import { SwipeDeck } from "@/components/swipe/SwipeDeck";
import { useAuth } from "@/lib/auth/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { submitAttempt, type SubmitAttemptResult } from "@/lib/game/submitAttempt";
import { useCelebrationStore } from "@/lib/store/celebrationStore";
import { fireConfetti } from "@/components/providers/CelebrationLayer";
import { TIERS } from "@/lib/tiers";
import type { Puzzle, TierId } from "@/types";

const VALID_TIERS = new Set(TIERS.map((t) => t.id));

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SwipeGamePage({ params }: PageProps<"/play/[tier]/[puzzleId]">) {
  const { tier: tierParam, puzzleId } = use(params);
  const searchParams = useSearchParams();
  const isDaily = searchParams.get("daily") === "1";

  const tierIsValid = VALID_TIERS.has(tierParam as TierId);
  const tier = (tierIsValid ? tierParam : "foal") as TierId;
  const puzzle = getPuzzle(tier, puzzleId);

  if (!tierIsValid || !puzzle) notFound();

  // Keyed by deck id: navigating "Next Deck" reuses this route without
  // an unmount, so the key forces a fresh SwipeGame instance (fresh
  // shuffled deck/timer) instead of carrying over the previous round.
  return <SwipeGame key={puzzle.id} tier={tier} puzzle={puzzle} isDaily={isDaily} />;
}

function SwipeGame({ tier, puzzle, isDaily }: { tier: TierId; puzzle: Puzzle; isDaily: boolean }) {
  const { user, refreshProfile } = useAuth();
  const { state, actions } = useSwipeMatch(puzzle);
  const [result, setResult] = useState<SubmitAttemptResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);
  const triggerLevelUp = useCelebrationStore((s) => s.triggerLevelUp);
  const queueAchievement = useCelebrationStore((s) => s.queueAchievement);
  const pushToast = useCelebrationStore((s) => s.pushToast);

  useEffect(() => {
    if (!state.isComplete || submittedRef.current || !user) return;
    submittedRef.current = true;
    setSubmitting(true);

    const supabase = createClient();
    submitAttempt(supabase, {
      userId: user.id,
      tier,
      puzzleId: puzzle.id,
      timeSeconds: state.elapsedSeconds,
      accuracy: state.accuracy,
      hintsUsed: 0,
      isDailyChallenge: isDaily,
    })
      .then((r) => {
        setResult(r);
        fireConfetti();
        pushToast({ kind: "xp", message: `+${r.xpEarned} XP` });
        pushToast({ kind: "coins", message: `+${r.coinsEarned} Sparkle Dust` });
        if (r.leveledUpTo) {
          setTimeout(() => triggerLevelUp(r.leveledUpTo!), 1200);
        }
        r.unlockedAchievements.forEach((a) => queueAchievement(a));
        refreshProfile();
      })
      .finally(() => setSubmitting(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isComplete, user]);

  return (
    <div className="flex flex-col items-center gap-6 pb-24">
      <div className="flex w-full max-w-xs items-center justify-between">
        <Link href={`/play/${tier}`} className="font-display text-sm font-bold text-ink-soft">
          ← {puzzle.theme}
        </Link>
        <div className="flex items-center gap-3 font-display text-sm font-bold text-unicorn-blue">
          <span>⏱ {formatTime(state.elapsedSeconds)}</span>
          <span>🎯 {state.accuracy}%</span>
        </div>
      </div>

      <SwipeDeck state={state} actions={actions} />

      {state.isComplete && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed inset-x-0 bottom-0 z-50 flex justify-center border-t border-line bg-cloud p-5 shadow-float"
        >
          <div className="flex w-full max-w-lg flex-col items-center gap-2 text-center">
            <p className="font-display text-2xl font-bold text-unicorn-blue">🎉 Deck Complete!</p>
            {submitting && <p className="text-sm text-ink-soft">Saving your results...</p>}
            {result && (
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-ink">
                <span>⏱ {formatTime(state.elapsedSeconds)}</span>
                <span>🎯 {state.accuracy}%</span>
                <span>⭐ Score {result.score}</span>
                <span className="text-unicorn-orange">+{result.xpEarned} XP</span>
                <span className="text-coin-outline">+{result.coinsEarned} 🪙</span>
              </div>
            )}
            <div className="mt-2 flex gap-3">
              <Link
                href={`/play/${tier}`}
                className="rounded-full bg-unicorn-orange px-5 py-2.5 font-display font-bold text-white shadow-float"
              >
                More Decks
              </Link>
              <Link
                href={`/leaderboard/${tier}`}
                className="rounded-full bg-unicorn-blue px-5 py-2.5 font-display font-bold text-white shadow-float"
              >
                Leaderboard
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
